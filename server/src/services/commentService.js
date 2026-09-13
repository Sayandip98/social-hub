import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import { createNotification } from "./notificationService.js";

// ---- Add Comment ----
const addComment = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.isArchived) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    post: postId,
    author: userId,
    text: text.trim(),
  });

  await Post.findByIdAndUpdate(postId, {
    $addToSet: { comments: comment._id },
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "username fullName avatar",
  );

  await createNotification({
    receiverId: post.author,
    senderId: userId,
    type: "comment",
    postId: postId,
    commentId: comment._id,
  });

  return populatedComment;
};

// ---- Get Post Comments ----
const getPostComments = async (postId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const [comments, total] = await Promise.all([
    Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName avatar")
      .populate({
        path: "replies",
        options: { limit: 2 },
        populate: {
          path: "author",
          select: "username fullName avatar",
        },
      }),
    Comment.countDocuments({ post: postId, parentComment: null }),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

// ---- Delete Comment ----
const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  if (!comment.parentComment) {
    await Comment.deleteMany({ parentComment: commentId });

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });
  } else {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $pull: { replies: commentId },
    });
  }

  await Comment.findByIdAndDelete(commentId);

  return { deleted: true };
};

// ---- Like Comment ----
const likeComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const alreadyLiked = comment.likes.includes(userId);
  if (alreadyLiked) {
    throw new ApiError(400, "Comment already liked");
  }

  await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });

  return { liked: true, likesCount: comment.likes.length + 1 };
};

// ---- Unlike Comment ----
const unlikeComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isLiked = comment.likes.includes(userId);
  if (!isLiked) {
    throw new ApiError(400, "Comment not liked yet");
  }

  await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });

  return { liked: false, likesCount: comment.likes.length - 1 };
};

// ---- Reply to Comment ----
const replyToComment = async (commentId, userId, text) => {
  const parentComment = await Comment.findById(commentId);

  if (!parentComment) {
    throw new ApiError(404, "Comment not found");
  }

  if (parentComment.parentComment) {
    throw new ApiError(400, "Cannot reply to a reply");
  }

  const reply = await Comment.create({
    post: parentComment.post,
    author: userId,
    text: text.trim(),
    parentComment: commentId,
  });

  await Comment.findByIdAndUpdate(commentId, {
    $addToSet: { replies: reply._id },
  });

  const populatedReply = await Comment.findById(reply._id).populate(
    "author",
    "username fullName avatar",
  );

  await createNotification({
    receiverId: parentComment.author,
    senderId: userId,
    type: "comment",
    postId: parentComment.post,
    commentId: reply._id,
  });

  return populatedReply;
};

// ---- Get Comment Replies ----
const getCommentReplies = async (commentId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const [replies, total] = await Promise.all([
    Comment.find({ parentComment: commentId })
      .sort({ createdAt: 1 }) // oldest first for replies
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName avatar"),
    Comment.countDocuments({ parentComment: commentId }),
  ]);

  return {
    replies,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

export {
  addComment,
  getPostComments,
  deleteComment,
  likeComment,
  unlikeComment,
  replyToComment,
  getCommentReplies,
};
