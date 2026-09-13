import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
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
} from "../services/postService.js";

const createPostController = asyncHandler(async (req, res) => {
  const post = await createPost(
    req.user._id,
    req.body,
    req.files,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, { post }, "Post created successfully"));
});

const getFeedController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await getFeed(
    req.user._id,
    Number(page) || 1,
    Number(limit) || 10,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Feed fetched successfully"));
});

const getBookmarksController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await getBookmarkedPosts(
    req.user._id,
    Number(page) || 1,
    Number(limit) || 12,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Bookmarks fetched successfully"));
});

const getUserPostsController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const result = await getUserPosts(
    userId,
    req.user._id,
    Number(page) || 1,
    Number(limit) || 12,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "User posts fetched successfully"));
});

const getPostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const result = await getPostById(postId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Post fetched successfully"));
});

const updatePostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await updatePost(postId, req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, { post }, "Post updated successfully"));
});

const deletePostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  await deletePost(postId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const likePostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const result = await likePost(postId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Post liked successfully"));
});

const unlikePostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const result = await unlikePost(postId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Post unliked successfully"));
});

const getPostLikesController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page, limit } = req.query;

  const result = await getPostLikes(
    postId,
    Number(page) || 1,
    Number(limit) || 20,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Post likes fetched successfully"));
});

const bookmarkPostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const result = await bookmarkPost(postId, req.user._id);

  const message = result.bookmarked
    ? "Post bookmarked successfully"
    : "Post removed from bookmarks";

  return res.status(200).json(new ApiResponse(200, result, message));
});

export {
  createPostController,
  getFeedController,
  getBookmarksController,
  getUserPostsController,
  getPostController,
  updatePostController,
  deletePostController,
  likePostController,
  unlikePostController,
  getPostLikesController,
  bookmarkPostController,
};
