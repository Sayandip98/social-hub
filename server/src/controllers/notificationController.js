import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteSingleNotification,
  clearAllNotifications,
} from "../services/notificationService.js";

const getNotificationsController = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await getUserNotifications(
    req.user._id,
    Number(page) || 1,
    Number(limit) || 20,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

const getUnreadCountController = asyncHandler(async (req, res) => {
  const result = await getUnreadCount(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Unread count fetched"));
});

const markAllAsReadController = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { read: true }, "All notifications marked as read"),
    );
});

const markAsReadController = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await markAsRead(notificationId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { read: true }, "Notification marked as read"));
});

const clearAllController = asyncHandler(async (req, res) => {
  await clearAllNotifications(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications cleared"));
});

const deleteNotificationController = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await deleteSingleNotification(notificationId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification deleted successfully"));
});

export {
  getNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
  clearAllController,
  deleteNotificationController,
};
