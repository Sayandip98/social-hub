import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { createNotification } from "../services/notificationService.js";

const registerChatSocket = (io, socket, onlineUsers) => {
  const userId = socket.user._id.toString();

  // ---- Join Conversation Rooms ----
  socket.on("conversations:join", async (conversationIds) => {
    if (!Array.isArray(conversationIds)) return;

    conversationIds.forEach((id) => {
      socket.join(`conversation:${id}`);
    });

    console.log(
      `${socket.user.username} joined ${conversationIds.length} conversation rooms`,
    );
  });

  // ---- Send Message ----
  socket.on("message:send", async (data) => {
    try {
      const { conversationId, text, tempId } = data;

      if (!conversationId) {
        socket.emit("message:error", { error: "Conversation ID required" });
        return;
      }

      if (!text?.trim()) {
        socket.emit("message:error", { error: "Message text required" });
        return;
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit("message:error", { error: "Conversation not found" });
        return;
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId,
      );

      if (!isParticipant) {
        socket.emit("message:error", { error: "Not a participant" });
        return;
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        text: text.trim(),
        seenBy: [userId],
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date(),
      });

      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "username fullName avatar",
      );

      io.to(`conversation:${conversationId}`).emit("message:new", {
        message: populatedMessage,
        tempId,
      });

      const otherParticipants = conversation.participants.filter(
        (p) => p.toString() !== userId,
      );

      for (const participantId of otherParticipants) {
        const recipientSocketId = onlineUsers.get(participantId.toString());
        const isInRoom = recipientSocketId
          ? io.sockets.adapter.rooms
              .get(`conversation:${conversationId}`)
              ?.has(recipientSocketId)
          : false;

        if (!isInRoom) {
          await createNotification({
            receiverId: participantId,
            senderId: userId,
            type: "message",
          });

          io.to(participantId.toString()).emit("notification:new", {
            type: "message",
            sender: socket.user,
            preview: text.substring(0, 50),
          });
        }
      }
    } catch (error) {
      console.error("message:send error:", error);
      socket.emit("message:error", {
        error: "Failed to send message",
      });
    }
  });

  // ---- Typing Indicators ----
  socket.on("typing:start", ({ conversationId }) => {
    if (!conversationId) return;

    socket.to(`conversation:${conversationId}`).emit("typing:start", {
      userId: userId,
      username: socket.user.username,
    });
  });

  socket.on("typing:stop", ({ conversationId }) => {
    if (!conversationId) return;

    socket.to(`conversation:${conversationId}`).emit("typing:stop", {
      userId: userId,
    });
  });

  // ---- Message Seen ----
  socket.on("message:seen", async ({ conversationId }) => {
    try {
      if (!conversationId) return;

      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId },
          seenBy: { $nin: [userId] },
        },
        { $addToSet: { seenBy: userId } },
      );

      socket.to(`conversation:${conversationId}`).emit("message:seen:ack", {
        conversationId,
        seenBy: userId,
      });
    } catch (error) {
      console.error("message:seen error:", error);
    }
  });
};

export { registerChatSocket };
