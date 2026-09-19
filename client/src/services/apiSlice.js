import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "./axiosInstance.js";

const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }) => {
    try {
      const response = await axiosInstance({
        url,
        method: method || "GET",
        data,
        params,
      });

      return { data: response.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Auth",
    "User",
    "Post",
    "Comment",
    "Story",
    "Chat",
    "Notification",
  ],
  endpoints: () => ({}),
});

export default apiSlice;
