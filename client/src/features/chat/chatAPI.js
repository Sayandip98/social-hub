import { apiSlice } from "@services/apiSlice.js";

export const chatAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get or create conversation
    getOrCreateConversation: builder.mutation({
      query: (targetUserId) => ({
        url: "/chat/conversations",
        method: "POST",
        data: { targetUserId },
      }),
      invalidatesTags: ["Chat"],
    }),

    // Get all conversations
    getConversations: builder.query({
      query: () => ({ url: "/chat/conversations" }),
      providesTags: ["Chat"],
    }),

    // Get messages
    getMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 30 }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        params: { page, limit },
      }),
      providesTags: (result, error, { conversationId }) => [
        { type: "Chat", id: conversationId },
      ],
    }),

    // Mark as seen
    markAsSeen: builder.mutation({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/seen`,
        method: "PUT",
      }),
      invalidatesTags: ["Chat"],
    }),

    // Delete message
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
    }),

    // Delete conversation
    deleteConversation: builder.mutation({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetOrCreateConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkAsSeenMutation,
  useDeleteMessageMutation,
  useDeleteConversationMutation,
} = chatAPI;
