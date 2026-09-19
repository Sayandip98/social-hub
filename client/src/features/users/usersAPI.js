import { apiSlice } from "@services/apiSlice.js";

export const usersAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile by username
    getUserProfile: builder.query({
      query: (username) => ({ url: `/users/${username}` }),
      providesTags: (result, error, username) => [
        { type: "User", id: username },
      ],
    }),

    // Update profile
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/users/update-profile",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    // Follow user
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/users/follow/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "User", id: userId },
        "Auth",
      ],
    }),

    // Unfollow user
    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/users/unfollow/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "User", id: userId },
        "Auth",
      ],
    }),

    // Get followers
    getFollowers: builder.query({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/users/${userId}/followers`,
        params: { page, limit },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "User", id: `${userId}-followers` },
      ],
    }),

    // Get following
    getFollowing: builder.query({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/users/${userId}/following`,
        params: { page, limit },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "User", id: `${userId}-following` },
      ],
    }),

    // Search users
    searchUsers: builder.query({
      query: ({ q, page = 1, limit = 10 }) => ({
        url: "/users/search",
        params: { q, page, limit },
      }),
      providesTags: ["User"],
    }),

    // Get suggestions
    getSuggestions: builder.query({
      query: (limit = 5) => ({
        url: "/users/suggestions",
        params: { limit },
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery,
  useGetSuggestionsQuery,
} = usersAPI;
