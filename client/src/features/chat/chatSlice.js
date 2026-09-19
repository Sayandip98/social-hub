import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    activeConversationId: null,
    messages: {},
    typingUsers: {},
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },

    // Add new message from socket
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;

      // Normalize conversationId to string
      const convId =
        typeof conversationId === "object"
          ? conversationId?.toString()
          : conversationId;

      if (!convId) return;

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      // Prevent duplicates — check both _id and tempId
      const exists = state.messages[convId].some(
        (m) =>
          m._id === message._id || (message.tempId && m._id === message.tempId),
      );

      if (!exists) {
        state.messages[convId].push(message);
      }
    },

    // Replace optimistic message with real server message
    replaceOptimisticMessage: (state, action) => {
      const { conversationId, tempId, message } = action.payload;

      const convId =
        typeof conversationId === "object"
          ? conversationId?.toString()
          : conversationId;

      if (!convId || !state.messages[convId]) {
        // If no optimistic message exists just add it
        if (convId) {
          if (!state.messages[convId]) {
            state.messages[convId] = [];
          }
          state.messages[convId].push(message);
        }
        return;
      }

      const index = state.messages[convId].findIndex((m) => m._id === tempId);

      if (index !== -1) {
        // Replace the placeholder
        state.messages[convId][index] = message;
      } else {
        // Optimistic message not found — just add
        const exists = state.messages[convId].some(
          (m) => m._id === message._id,
        );
        if (!exists) {
          state.messages[convId].push(message);
        }
      }
    },

    // Set full message list for a conversation
    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;

      const convId =
        typeof conversationId === "object"
          ? conversationId?.toString()
          : conversationId;

      if (convId) {
        state.messages[convId] = messages;
      }
    },

    // Typing indicators
    setTyping: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;

      const convId =
        typeof conversationId === "object"
          ? conversationId?.toString()
          : conversationId;

      if (!convId) return;

      if (!state.typingUsers[convId]) {
        state.typingUsers[convId] = [];
      }

      if (isTyping) {
        if (!state.typingUsers[convId].includes(userId)) {
          state.typingUsers[convId].push(userId);
        }
      } else {
        state.typingUsers[convId] = state.typingUsers[convId].filter(
          (id) => id !== userId,
        );
      }
    },
  },
});

export const {
  setActiveConversation,
  addMessage,
  replaceOptimisticMessage,
  setMessages,
  setTyping,
} = chatSlice.actions;

export const selectActiveConversationId = (state) =>
  state.chat.activeConversationId;

export const selectMessages = (conversationId) => (state) => {
  const convId =
    typeof conversationId === "object"
      ? conversationId?.toString()
      : conversationId;
  return state.chat.messages[convId] || [];
};

export const selectTypingUsers = (conversationId) => (state) => {
  const convId =
    typeof conversationId === "object"
      ? conversationId?.toString()
      : conversationId;
  return state.chat.typingUsers[convId] || [];
};

export default chatSlice.reducer;
