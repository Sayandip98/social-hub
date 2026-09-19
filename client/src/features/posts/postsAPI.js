import { apiSlice } from "@services/apiSlice.js";

export const postsAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get feed
    getFeed: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/posts/feed",
        params: { page, limit },
      }),
      providesTags: ["Post"],
    }),

    // Get single post
    getPost: builder.query({
      query: (postId) => ({ url: `/posts/${postId}` }),
      providesTags: (result, error, postId) => [{ type: "Post", id: postId }],
    }),

    // Get user posts
    getUserPosts: builder.query({
      query: ({ userId, page = 1, limit = 12 }) => ({
        url: `/posts/user/${userId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "Post", id: `user-${userId}` },
      ],
    }),

    // Get bookmarks
    getBookmarks: builder.query({
      query: ({ page = 1, limit = 12 } = {}) => ({
        url: "/posts/bookmarks",
        params: { page, limit },
      }),
      providesTags: ["Post"],
    }),

    // Like post
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        "Post",
      ],
    }),

    // Unlike post
    unlikePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/unlike`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        "Post",
      ],
    }),

    // Bookmark post
    bookmarkPost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/bookmark`,
        method: "POST",
      }),
      invalidatesTags: ["Post"],
    }),

    // Delete post
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),

    // Get post likes
    getPostLikes: builder.query({
      query: ({ postId, page = 1 }) => ({
        url: `/posts/${postId}/likes`,
        params: { page },
      }),
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetPostQuery,
  useGetUserPostsQuery,
  useGetBookmarksQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useBookmarkPostMutation,
  useDeletePostMutation,
  useGetPostLikesQuery,
} = postsAPI;
