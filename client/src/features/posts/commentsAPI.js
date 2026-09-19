import { apiSlice } from "@services/apiSlice.js";

export const commentsAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get comments
    getComments: builder.query({
      query: ({ postId, page = 1, limit = 20 }) => ({
        url: `/comments/${postId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { postId }) => [
        { type: "Comment", id: postId },
      ],
    }),

    // Add comment
    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/comments/${postId}`,
        method: "POST",
        data: { text },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comment", id: postId },
      ],
    }),

    // Delete comment
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),

    // Like comment
    likeComment: builder.mutation({
      query: (commentId) => ({
        url: `/comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Comment"],
    }),

    // Reply to comment
    replyToComment: builder.mutation({
      query: ({ commentId, text }) => ({
        url: `/comments/${commentId}/reply`,
        method: "POST",
        data: { text },
      }),
      invalidatesTags: ["Comment"],
    }),

    // Get replies
    getReplies: builder.query({
      query: ({ commentId, page = 1 }) => ({
        url: `/comments/${commentId}/replies`,
        params: { page },
      }),
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useReplyToCommentMutation,
  useGetRepliesQuery,
} = commentsAPI;
