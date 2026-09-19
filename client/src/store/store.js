import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@services/apiSlice.js";
import authReducer from "@features/auth/authSlice.js";
import chatReducer from "@features/chat/chatSlice.js";
import notificationsReducer from "@features/notifications/notificationsSlice.js";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,

    auth: authReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
