import User from "../models/User.js";
import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadAvatar,
  uploadCoverImage,
  deleteFromCloudinary,
} from "./uploadService.js";

// ---- Get User Profile ----
const getUserProfile = async (username, currentUserId) => {
  const user = await User.findOne({ username })
    .select("-password -refreshToken")
    .populate("followers", "username fullName avatar")
    .populate("following", "username fullName avatar");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const postCount = await Post.countDocuments({
    author: user._id,
    isArchived: false,
  });

  const isFollowing = user.followers.some(
    (follower) => follower._id.toString() === currentUserId.toString(),
  );

  const isOwnProfile = user._id.toString() === currentUserId.toString();

  return {
    user,
    postCount,
    isFollowing,
    isOwnProfile,
  };
};

// ---- Update Profile ----
const updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// ---- Update Avatar ----
const updateUserAvatar = async (userId, file) => {
  if (!file) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { public_id, url } = await uploadAvatar(file);

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatar: { public_id, url } },
    { returnDocument: "after" },
  ).select("-password -refreshToken");

  return updatedUser;
};

// ---- Update Cover Image ----
const updateUserCover = async (userId, file) => {
  if (!file) {
    throw new ApiError(400, "Cover image file is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { public_id, url } = await uploadCoverImage(file);

  if (user.coverImage?.public_id) {
    await deleteFromCloudinary(user.coverImage.public_id);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { coverImage: { public_id, url } },
    { returnDocument: "after" },
  ).select("-password -refreshToken");

  return updatedUser;
};

// ---- Follow User ----
const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const alreadyFollowing = currentUser.following.includes(targetUserId);
  if (alreadyFollowing) {
    throw new ApiError(400, "You are already following this user");
  }

  await Promise.all([
    User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    }),
    User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    }),
  ]);

  return { followed: true };
};

// ---- Unfollow User ----
const unfollowUser = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const isFollowing = currentUser.following.includes(targetUserId);
  if (!isFollowing) {
    throw new ApiError(400, "You are not following this user");
  }

  await Promise.all([
    User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    }),
    User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    }),
  ]);

  return { unfollowed: true };
};

// ---- Get Followers ----
const getFollowers = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("followers").populate({
    path: "followers",
    select: "username fullName avatar bio",
    options: { skip, limit },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const totalFollowers = await User.findById(userId)
    .select("followers")
    .then((u) => u.followers.length);

  return {
    followers: user.followers,
    total: totalFollowers,
    page,
    totalPages: Math.ceil(totalFollowers / limit),
  };
};

// ---- Get Following ----
const getFollowing = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("following").populate({
    path: "following",
    select: "username fullName avatar bio",
    options: { skip, limit },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const totalFollowing = await User.findById(userId)
    .select("following")
    .then((u) => u.following.length);

  return {
    following: user.following,
    total: totalFollowing,
    page,
    totalPages: Math.ceil(totalFollowing / limit),
  };
};

// ---- Search Users ----
const searchUsers = async (query, currentUserId, page = 1, limit = 10) => {
  if (!query || query.trim() === "") {
    throw new ApiError(400, "Search query is required");
  }

  const skip = (page - 1) * limit;

  // Case-insensitive search on username and fullName
  const searchFilter = {
    $or: [
      { username: { $regex: query, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
    ],
    _id: { $ne: currentUserId }, // exclude current user
    isActive: true,
  };

  const [users, total] = await Promise.all([
    User.find(searchFilter)
      .select("username fullName avatar bio followers")
      .skip(skip)
      .limit(limit),
    User.countDocuments(searchFilter),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// ---- Follow Suggestions ----
const getFollowSuggestions = async (currentUserId, limit = 10) => {
  const currentUser = await User.findById(currentUserId).select("following");
  const excludeIds = [currentUserId, ...currentUser.following];

  const suggestions = await User.find({
    _id: { $nin: excludeIds },
    isActive: true,
  })
    .select("username fullName avatar bio followers")
    .limit(limit)
    .sort({ createdAt: -1 });

  return suggestions;
};

export {
  getUserProfile,
  updateProfile,
  updateUserAvatar,
  updateUserCover,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getFollowSuggestions,
};