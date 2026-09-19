import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    unreadCount: 0,
    realtimeNotifications: [],
  },
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },

    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },

    // Add real-time notification from socket
    addRealtimeNotification: (state, action) => {
      state.realtimeNotifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  resetUnreadCount,
  addRealtimeNotification,
} = notificationsSlice.actions;

export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectRealtimeNotifications = (state) =>
  state.notifications.realtimeNotifications;

export default notificationsSlice.reducer;
