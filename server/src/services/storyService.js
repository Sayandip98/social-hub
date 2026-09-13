import Story from "../models/Story.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { uploadStoryMedia, deleteFromCloudinary } from "./uploadService.js";

// ---- Create Story ----
const createStory = async (userId, text, file) => {
  if (!file) {
    throw new ApiError(400, "Media file is required for a story");
  }

  const { public_id, url } = await uploadStoryMedia(file);

  const story = await Story.create({
    author: userId,
    media: {
      public_id,
      url,
      mediaType: file.mimetype.startsWith("video") ? "video" : "image",
    },
    text: text || "",
  });

  const populatedStory = await Story.findById(story._id).populate(
    "author",
    "username fullName avatar",
  );

  return populatedStory;
};

// ---- Get Story Feed ----
const getStoryFeed = async (currentUserId) => {
  const currentUser = await User.findById(currentUserId).select("following");
  const followingIds = currentUser.following;

  const feedUserIds = [currentUserId, ...followingIds];

  const stories = await Story.find({
    author: { $in: feedUserIds },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .populate("author", "username fullName avatar");

  const grouped = groupStoriesByUser(stories, currentUserId);

  return grouped;
};

// Helper — groups flat story array into per-user buckets
const groupStoriesByUser = (stories, currentUserId) => {
  const map = new Map();

  for (const story of stories) {
    const authorId = story.author._id.toString();

    if (!map.has(authorId)) {
      map.set(authorId, {
        user: story.author,
        stories: [],
        hasUnviewed: false,
      });
    }

    const group = map.get(authorId);
    group.stories.push(story);

    const viewed = story.viewers.some(
      (v) => v.user.toString() === currentUserId.toString(),
    );
    if (!viewed) {
      group.hasUnviewed = true;
    }
  }

  const result = [...map.values()];

  result.sort((a, b) => {
    const aIsCurrentUser = a.user._id.toString() === currentUserId.toString();
    const bIsCurrentUser = b.user._id.toString() === currentUserId.toString();

    if (aIsCurrentUser) return -1;
    if (bIsCurrentUser) return 1;
    if (a.hasUnviewed && !b.hasUnviewed) return -1;
    if (!a.hasUnviewed && b.hasUnviewed) return 1;
    return 0;
  });

  return result;
};

// ---- Get User Stories ----
const getUserStories = async (userId, currentUserId) => {
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

  const stories = await Story.find({
    author: userId,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: 1 })
    .populate("author", "username fullName avatar");

  return stories;
};

// ---- View Story ----
const viewStory = async (storyId, userId) => {
  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, "Story not found or expired");
  }

  if (story.author.toString() === userId.toString()) {
    return { viewed: true };
  }

  const alreadyViewed = story.viewers.some(
    (v) => v.user.toString() === userId.toString(),
  );

  if (!alreadyViewed) {
    await Story.findByIdAndUpdate(storyId, {
      $addToSet: {
        viewers: {
          user: userId,
          viewedAt: new Date(),
        },
      },
    });
  }

  return { viewed: true };
};

// ---- Get Story Viewers ----
const getStoryViewers = async (storyId, userId) => {
  const story = await Story.findById(storyId).populate(
    "viewers.user",
    "username fullName avatar",
  );

  if (!story) {
    throw new ApiError(404, "Story not found or expired");
  }

  if (story.author.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the story author can see viewers");
  }

  return {
    viewers: story.viewers,
    viewersCount: story.viewers.length,
  };
};

// ---- Delete Story ----
const deleteStory = async (storyId, userId) => {
  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  if (story.author.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this story");
  }

  await deleteFromCloudinary(
    story.media.public_id,
    story.media.mediaType === "video" ? "video" : "image",
  );

  await Story.findByIdAndDelete(storyId);

  return { deleted: true };
};

export {
  createStory,
  getStoryFeed,
  getUserStories,
  viewStory,
  getStoryViewers,
  deleteStory,
};
