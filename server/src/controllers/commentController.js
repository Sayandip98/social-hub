import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  addComment,
  getPostComments,
  deleteComment,
  likeComment,
  unlikeComment,
  replyToComment,
  getCommentReplies,
} from "../services/commentService.js";

const addCommentController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  const comment = await addComment(postId, req.user._id, text);

  return res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added successfully"));
});

const getPostCommentsController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page, limit } = req.query;

  const result = await getPostComments(
    postId,
    Number(page) || 1,
    Number(limit) || 20,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"));
});

const deleteCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  await deleteComment(commentId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

const likeCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const result = await likeComment(commentId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comment liked successfully"));
});

const unlikeCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const result = await unlikeComment(commentId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comment unliked successfully"));
});

const replyToCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const reply = await replyToComment(commentId, req.user._id, text);

  return res
    .status(201)
    .json(new ApiResponse(201, { reply }, "Reply added successfully"));
});

const getCommentRepliesController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { page, limit } = req.query;

  const result = await getCommentReplies(
    commentId,
    Number(page) || 1,
    Number(limit) || 10,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Replies fetched successfully"));
});

export {
  addCommentController,
  getPostCommentsController,
  deleteCommentController,
  likeCommentController,
  unlikeCommentController,
  replyToCommentController,
  getCommentRepliesController,
};
