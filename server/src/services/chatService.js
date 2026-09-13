import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { uploadMessageMedia, deleteFromCloudinary } from "./uploadService.js";

// ---- Get or Create Conversation ----
const getOrCreateConversation = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "Cannot create conversation with yourself");
  }

  const targetUser = await User.findById(targetUserId).select(
    "username fullName avatar isActive",
  );
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (!targetUser.isActive) {
    throw new ApiError(403, "This account is deactivated");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, targetUserId] },
    isGroup: false,
  })
    .populate("participants", "username fullName avatar isActive")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username avatar",
      },
    });

  if (conversation) {
    return { conversation, isNew: false };
  }

  conversation = await Conversation.create({
    participants: [currentUserId, targetUserId],
    isGroup: false,
  });

  conversation = await Conversation.findById(conversation._id).populate(
    "participants",
    "username fullName avatar isActive",
  );

  return { conversation, isNew: true };
};

// ---- Get All Conversations ----
const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: { $in: [userId] },
  })
    .sort({ updatedAt: -1 })
    .populate("participants", "username fullName avatar isActive")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username avatar",
      },
    });

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        seenBy: { $nin: [userId] },
        sender: { $ne: userId },
      });

      return {
        ...conv.toObject(),
        unreadCount,
      };
    }),
  );

  return conversationsWithUnread;
};

// ---- Get Single Conversation ----
const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "username fullName avatar isActive")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username avatar",
      },
    });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p._id.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this conversation");
  }

  return conversation;
};

// ---- Delete Conversation ----
const deleteConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this conversation");
  }

  // Get all messages with media to delete from Cloudinary
  const messagesWithMedia = await Message.find({
    conversation: conversationId,
    "media.public_id": { $ne: "" },
  });

  await Promise.all(
    messagesWithMedia.map((msg) =>
      deleteFromCloudinary(
        msg.media.public_id,
        msg.media.mediaType === "video" ? "video" : "image",
      ),
    ),
  );

  await Message.deleteMany({ conversation: conversationId });

  await Conversation.findByIdAndDelete(conversationId);

  return { deleted: true };
};

// ---- Send Message ----
const sendMessage = async (conversationId, senderId, text, file) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === senderId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this conversation");
  }

  if (!text && !file) {
    throw new ApiError(400, "Message must have text or media");
  }

  let media = { public_id: "", url: "", mediaType: undefined };
  if (file) {
    const uploaded = await uploadMessageMedia(file);
    media = {
      public_id: uploaded.public_id,
      url: uploaded.url,
      mediaType: file.mimetype.startsWith("video") ? "video" : "image",
    };
  }

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text: text || "",
    media,
    seenBy: [senderId],
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "username fullName avatar",
  );

  return populatedMessage;
};

// ---- Get Messages ----
const getMessages = async (conversationId, userId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this conversation");
  }

  const [messages, total] = await Promise.all([
    Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username fullName avatar"),
    Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    }),
  ]);

  return {
    messages: messages.reverse(),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

// ---- Delete Message ----
const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  await Message.findByIdAndUpdate(messageId, {
    isDeleted: true,
    text: "",
    media: {},
  });

  if (message.media?.public_id) {
    await deleteFromCloudinary(
      message.media.public_id,
      message.media.mediaType === "video" ? "video" : "image",
    );
  }

  return { deleted: true };
};

// ---- Mark Messages as Seen ----
const markMessagesAsSeen = async (conversationId, userId) => {
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      seenBy: { $nin: [userId] },
    },
    { $addToSet: { seenBy: userId } },
  );

  return { seen: true };
};

export {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  sendMessage,
  getMessages,
  deleteMessage,
  markMessagesAsSeen,
};
