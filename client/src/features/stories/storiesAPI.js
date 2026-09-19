import { apiSlice } from "@services/apiSlice.js";

export const storiesAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get story feed
    getStoryFeed: builder.query({
      query: () => ({ url: "/stories/feed" }),
      providesTags: ["Story"],
    }),

    // Get user stories
    getUserStories: builder.query({
      query: (userId) => ({ url: `/stories/user/${userId}` }),
      providesTags: (result, error, userId) => [{ type: "Story", id: userId }],
    }),

    // View story
    viewStory: builder.mutation({
      query: (storyId) => ({
        url: `/stories/${storyId}/view`,
        method: "POST",
      }),
      invalidatesTags: ["Story"],
    }),

    // Delete story
    deleteStory: builder.mutation({
      query: (storyId) => ({
        url: `/stories/${storyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Story"],
    }),

    // Get story viewers
    getStoryViewers: builder.query({
      query: (storyId) => ({ url: `/stories/${storyId}/viewers` }),
    }),
  }),
});

export const {
  useGetStoryFeedQuery,
  useGetUserStoriesQuery,
  useViewStoryMutation,
  useDeleteStoryMutation,
  useGetStoryViewersQuery,
} = storiesAPI;
