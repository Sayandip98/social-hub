import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  sendMessage,
  getMessages,
  deleteMessage,
  markMessagesAsSeen,
} from "../services/chatService.js";

const getOrCreateConversationController = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  const result = await getOrCreateConversation(req.user._id, targetUserId);

  return res
    .status(result.isNew ? 201 : 200)
    .json(
      new ApiResponse(
        result.isNew ? 201 : 200,
        { conversation: result.conversation },
        result.isNew ? "Conversation created" : "Conversation fetched",
      ),
    );
});

const getUserConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getUserConversations(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { conversations },
        "Conversations fetched successfully",
      ),
    );
});

const getConversationController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await getConversationById(conversationId, req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { conversation },
        "Conversation fetched successfully",
      ),
    );
});

const deleteConversationController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await deleteConversation(conversationId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Conversation deleted successfully"));
});

const sendMessageController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  const message = await sendMessage(
    conversationId,
    req.user._id,
    text,
    req.file,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, { message }, "Message sent successfully"));
});

const getMessagesController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page, limit } = req.query;

  const result = await getMessages(
    conversationId,
    req.user._id,
    Number(page) || 1,
    Number(limit) || 30,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Messages fetched successfully"));
});

const deleteMessageController = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  await deleteMessage(messageId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

const markAsSeenController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await markMessagesAsSeen(conversationId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { seen: true }, "Messages marked as seen"));
});

export {
  getOrCreateConversationController,
  getUserConversationsController,
  getConversationController,
  deleteConversationController,
  sendMessageController,
  getMessagesController,
  deleteMessageController,
  markAsSeenController,
};
