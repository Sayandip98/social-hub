import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadMultiplePostMedia,
  deleteFromCloudinary,
} from "./uploadService.js";
import {
  createNotification,
  removeNotification,
} from "./notificationService.js";

// ---- Create Post ----
const createPost = async (userId, postData, files) => {
  if (!files || files.length === 0) {
    throw new ApiError(400, "At least one image or video is required");
  }

  const mediaResults = await uploadMultiplePostMedia(files);

  const media = mediaResults.map((result, index) => ({
    public_id: result.public_id,
    url: result.url,
    mediaType: files[index].mimetype.startsWith("video") ? "video" : "image",
  }));

  const extractedHashtags = postData.caption
    ? [...postData.caption.matchAll(/#(\w+)/g)].map((match) =>
        match[1].toLowerCase(),
      )
    : [];

  const post = await Post.create({
    author: userId,
    caption: postData.caption || "",
    location: postData.location || "",
    tags: postData.tags || [],
    hashtags: [
      ...new Set([...extractedHashtags, ...(postData.hashtags || [])]),
    ],
    media,
  });

  const populatedPost = await Post.findById(post._id).populate(
    "author",
    "username fullName avatar",
  );

  return populatedPost;
};

// ---- Get Single Post ----
const getPostById = async (postId, currentUserId) => {
  const post = await Post.findById(postId)
    .populate("author", "username fullName avatar isPrivate")
    .populate({
      path: "comments",
      options: { sort: { createdAt: -1 }, limit: 10 },
      populate: {
        path: "author",
        select: "username fullName avatar",
      },
    })
    .populate("tags", "username fullName avatar");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.isArchived) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.isPrivate) {
    const author = await User.findById(post.author._id).select("followers");
    const isFollower = author.followers.some(
      (f) => f.toString() === currentUserId.toString(),
    );
    const isOwner = post.author._id.toString() === currentUserId.toString();

    if (!isFollower && !isOwner) {
      throw new ApiError(403, "This account is private");
    }
  }

  const isLiked = post.likes.some(
    (id) => id.toString() === currentUserId.toString(),
  );

  const currentUser = await User.findById(currentUserId).select("bookmarks");
  const isBookmarked = currentUser.bookmarks.some(
    (id) => id.toString() === postId.toString(),
  );

  return { post, isLiked, isBookmarked };
};

// ---- Get Feed ----
const getFeed = async (currentUserId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const currentUser = await User.findById(currentUserId).select("following");
  const followingIds = currentUser.following;

  const feedUserIds = [currentUserId, ...followingIds];

  const [posts, total] = await Promise.all([
    Post.find({
      author: { $in: feedUserIds },
      isArchived: false,
    })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName avatar isPrivate")
      .populate({
        path: "comments",
        options: { limit: 3 },
        populate: {
          path: "author",
          select: "username avatar",
        },
      }),
    Post.countDocuments({
      author: { $in: feedUserIds },
      isArchived: false,
    }),
  ]);

  const currentUserBookmarks = currentUser.bookmarks || [];
  const postsWithFlags = posts.map((post) => ({
    ...post.toObject(),
    isLiked: post.likes.some(
      (id) => id.toString() === currentUserId.toString(),
    ),
    isBookmarked: currentUserBookmarks.some(
      (id) => id.toString() === post._id.toString(),
    ),
  }));

  return {
    posts: postsWithFlags,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

// ---- Get User Posts ----
const getUserPosts = async (userId, currentUserId, page = 1, limit = 12) => {
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("isPrivate followers");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isPrivate) {
    const isFollower = user.followers.some(
      (f) => f.toString() === currentUserId.toString(),
    );
    const isOwner = userId.toString() === currentUserId.toString();

    if (!isFollower && !isOwner) {
      throw new ApiError(403, "This account is private");
    }
  }

  const [posts, total] = await Promise.all([
    Post.find({ author: userId, isArchived: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName avatar"),
    Post.countDocuments({ author: userId, isArchived: false }),
  ]);

  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

// ---- Update Post ----
const updatePost = async (postId, userId, updateData) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this post");
  }

  // Re-extract hashtags if caption updated
  if (updateData.caption) {
    const extractedHashtags = [...updateData.caption.matchAll(/#(\w+)/g)].map(
      (match) => match[1].toLowerCase(),
    );

    updateData.hashtags = [...new Set(extractedHashtags)];
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $set: updateData },
    { returnDocument: "after", runValidators: true },
  ).populate("author", "username fullName avatar");

  return updatedPost;
};

// ---- Delete Post ----
const deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  const deletePromises = post.media.map((item) =>
    deleteFromCloudinary(
      item.public_id,
      item.mediaType === "video" ? "video" : "image",
    ),
  );
  await Promise.all(deletePromises);

  await Comment.deleteMany({ post: postId });

  await User.updateMany(
    { bookmarks: postId },
    { $pull: { bookmarks: postId } },
  );

  await Post.findByIdAndDelete(postId);

  return { deleted: true };
};

// ---- Like Post ----
const likePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const alreadyLiked = post.likes.includes(userId);
  if (alreadyLiked) {
    throw new ApiError(400, "Post already liked");
  }

  await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });

  await createNotification({
    receiverId: post.author,
    senderId: userId,
    type: "like",
    postId: postId,
  });

  return { liked: true, likesCount: post.likes.length + 1 };
};

// ---- Unlike Post ----
const unlikePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const isLiked = post.likes.includes(userId);
  if (!isLiked) {
    throw new ApiError(400, "Post not liked yet");
  }

  await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });

  await removeNotification({
    receiverId: post.author,
    senderId: userId,
    type: "like",
    postId: postId,
  });

  return { liked: false, likesCount: post.likes.length - 1 };
};

// ---- Get Post Likes ----
const getPostLikes = async (postId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const post = await Post.findById(postId).select("likes").populate({
    path: "likes",
    select: "username fullName avatar",
    options: { skip, limit },
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return {
    likes: post.likes,
    total: post.likes.length,
    page,
    totalPages: Math.ceil(post.likes.length / limit),
  };
};

// ---- Bookmark Post ----
const bookmarkPost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const user = await User.findById(userId).select("bookmarks");

  const alreadyBookmarked = user.bookmarks.includes(postId);

  if (alreadyBookmarked) {
    // Remove bookmark
    await User.findByIdAndUpdate(userId, { $pull: { bookmarks: postId } });
    return { bookmarked: false };
  } else {
    // Add bookmark
    await User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: postId } });
    return { bookmarked: true };
  }
};

// ---- Get Bookmarked Posts ----
const getBookmarkedPosts = async (userId, page = 1, limit = 12) => {
  const skip = (page - 1) * limit;

  const user = await User.findById(userId)
    .select("bookmarks")
    .populate({
      path: "bookmarks",
      match: { isArchived: false },
      options: { skip, limit, sort: { createdAt: -1 } },
      populate: {
        path: "author",
        select: "username fullName avatar",
      },
    });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    posts: user.bookmarks,
    total: user.bookmarks.length,
    page,
    totalPages: Math.ceil(user.bookmarks.length / limit),
  };
};

export {
  createPost,
  getPostById,
  getFeed,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostLikes,
  bookmarkPost,
  getBookmarkedPosts,
};
