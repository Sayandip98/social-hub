import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
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
} from "../services/userService.js";

const searchUsersController = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;

  const result = await searchUsers(
    q,
    req.user._id,
    Number(page) || 1,
    Number(limit) || 10,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Search results fetched"));
});

const getFollowSuggestionsController = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const suggestions = await getFollowSuggestions(
    req.user._id,
    Number(limit) || 10,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { suggestions }, "Suggestions fetched"));
});

const getUserProfileController = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const result = await getUserProfile(username, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Profile fetched successfully"));
});

const updateProfileController = asyncHandler(async (req, res) => {
  const { fullName, bio, website, gender, isPrivate } = req.body;

  const user = await updateProfile(req.user._id, {
    fullName,
    bio,
    website,
    gender,
    isPrivate,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

const updateAvatarController = asyncHandler(async (req, res) => {
  const user = await updateUserAvatar(req.user._id, req.file);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Avatar updated successfully"));
});

const updateCoverController = asyncHandler(async (req, res) => {
  const user = await updateUserCover(req.user._id, req.file);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Cover image updated successfully"));
});

const followUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await followUser(req.user._id, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "User followed successfully"));
});

const unfollowUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await unfollowUser(req.user._id, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "User unfollowed successfully"));
});

const getFollowersController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const result = await getFollowers(
    userId,
    Number(page) || 1,
    Number(limit) || 20,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Followers fetched successfully"));
});

const getFollowingController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const result = await getFollowing(
    userId,
    Number(page) || 1,
    Number(limit) || 20,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Following fetched successfully"));
});

export {
  getUserProfileController,
  updateProfileController,
  updateAvatarController,
  updateCoverController,
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
  searchUsersController,
  getFollowSuggestionsController,
};
