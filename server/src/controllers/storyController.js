import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createStory,
  getStoryFeed,
  getUserStories,
  viewStory,
  getStoryViewers,
  deleteStory,
} from "../services/storyService.js";

const createStoryController = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const story = await createStory(req.user._id, text, req.file);

  return res
    .status(201)
    .json(new ApiResponse(201, { story }, "Story created successfully"));
});

const getStoryFeedController = asyncHandler(async (req, res) => {
  const feed = await getStoryFeed(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { feed }, "Story feed fetched successfully"));
});

const getUserStoriesController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const stories = await getUserStories(userId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { stories }, "Stories fetched successfully"));
});

const viewStoryController = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  const result = await viewStory(storyId, req.user._id);

  return res.status(200).json(new ApiResponse(200, result, "Story viewed"));
});

const getStoryViewersController = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  const result = await getStoryViewers(storyId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Story viewers fetched successfully"));
});

const deleteStoryController = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  await deleteStory(storyId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Story deleted successfully"));
});

export {
  createStoryController,
  getStoryFeedController,
  getUserStoriesController,
  viewStoryController,
  getStoryViewersController,
  deleteStoryController,
};
