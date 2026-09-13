import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";

// ---- Create Notification ----
const createNotification = async ({
  receiverId,
  senderId,
  type,
  postId = null,
  commentId = null,
  storyId = null,
}) => {
  if (receiverId.toString() === senderId.toString()) {
    return null;
  }

  const existingNotification = await Notification.findOne({
    receiver: receiverId,
    sender: senderId,
    type,
    post: postId,
    comment: commentId,
    story: storyId,
  });

  if (existingNotification) {
    return existingNotification;
  }

  const notification = await Notification.create({
    receiver: receiverId,
    sender: senderId,
    type,
    post: postId,
    comment: commentId,
    story: storyId,
  });

  // Populate for real-time emission via socket
  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "username fullName avatar")
    .populate("receiver", "username fullName avatar")
    .populate("post", "media caption")
    .populate("comment", "text")
    .populate("story", "media");

  return populatedNotification;
};

// ---- Delete Notification ----
const removeNotification = async ({
  receiverId,
  senderId,
  type,
  postId = null,
  commentId = null,
}) => {
  await Notification.findOneAndDelete({
    receiver: receiverId,
    sender: senderId,
    type,
    post: postId,
    comment: commentId,
  });

  return true;
};

// ---- Get User Notifications ----
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ receiver: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username fullName avatar")
      .populate("post", "media caption")
      .populate("comment", "text")
      .populate("story", "media"),
    Notification.countDocuments({ receiver: userId }),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

// ---- Get Unread Count ----
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    receiver: userId,
    isRead: false,
  });

  return { unreadCount: count };
};

// ---- Mark Single Notification as Read ----
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.receiver.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  await Notification.findByIdAndUpdate(notificationId, { isRead: true });

  return { read: true };
};

// ---- Mark All as Read ----
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { receiver: userId, isRead: false },
    { isRead: true },
  );

  return { read: true };
};

// ---- Delete Single Notification ----
const deleteSingleNotification = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.receiver.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  await Notification.findByIdAndDelete(notificationId);

  return { deleted: true };
};

// ---- Clear All Notifications ----
const clearAllNotifications = async (userId) => {
  await Notification.deleteMany({ receiver: userId });

  return { cleared: true };
};

export {
  // Internal
  createNotification,
  removeNotification,
  // External
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteSingleNotification,
  clearAllNotifications,
};
