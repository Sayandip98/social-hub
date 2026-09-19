import { apiSlice } from "@services/apiSlice.js";

export const notificationsAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get notifications
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: "/notifications",
        params: { page, limit },
      }),
      providesTags: ["Notification"],
    }),

    // Get unread count
    getUnreadCount: builder.query({
      query: () => ({ url: "/notifications/unread-count" }),
      providesTags: ["Notification"],
    }),

    // Mark all as read
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Mark single as read
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Clear all
    clearAllNotifications: builder.mutation({
      query: () => ({
        url: "/notifications/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Delete single
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useClearAllNotificationsMutation,
  useDeleteNotificationMutation,
} = notificationsAPI;
