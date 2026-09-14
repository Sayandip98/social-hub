export const APP_NAME = import.meta.env.VITE_APP_NAME || "SocialHub";
export const API_URL = import.meta.env.VITE_API_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  FEED: "/feed",
  PROFILE: "/profile/:username",
  POST: "/post/:postId",
  CHAT: "/chat",
  SEARCH: "/search",
  NOTIFICATIONS: "/notifications",
  NOT_FOUND: "*",
};

export const PAGINATION = {
  FEED_LIMIT: 10,
  POSTS_LIMIT: 12,
  COMMENTS_LIMIT: 20,
  MESSAGES_LIMIT: 30,
  NOTIFICATIONS_LIMIT: 20,
  SEARCH_LIMIT: 10,
  FOLLOWERS_LIMIT: 20,
};

export const FILE_LIMITS = {
  AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
  COVER_SIZE: 10 * 1024 * 1024, // 10MB
  POST_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_POST_FILES: 10,
};

export const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

export const ACCEPTED_MEDIA_TYPES = {
  ...ACCEPTED_IMAGE_TYPES,
  "video/mp4": [".mp4"],
  "video/mov": [".mov"],
};
