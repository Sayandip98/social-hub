import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  MessageSquare,
} from "lucide-react";
import { Avatar, Spinner } from "@components/ui/index.js";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@features/notifications/notificationsAPI.js";
import { useDispatch } from "react-redux";
import { resetUnreadCount } from "@features/notifications/notificationsSlice.js";
import { timeAgo } from "@utils/formatDate.js";
import toast from "react-hot-toast";
import styles from "./NotificationsPage.module.css";

// ---- Icon badge by type ----
const NotificationIcon = ({ type }) => {
  const icons = {
    like: <Heart size={10} fill="currentColor" />,
    comment: <MessageCircle size={10} />,
    follow: <UserPlus size={10} />,
    mention: <AtSign size={10} />,
    message: <MessageSquare size={10} />,
  };

  return (
    <div className={`${styles.iconBadge} ${styles[type] || styles.like}`}>
      {icons[type] || icons.like}
    </div>
  );
};

// ---- Notification text by type ----
const getNotificationText = (notification) => {
  const username = notification.sender?.username;

  const texts = {
    like: "liked your post",
    comment: "commented on your post",
    follow: "started following you",
    mention: "mentioned you in a comment",
    message: "sent you a message",
  };

  return texts[notification.type] || "interacted with you";
};

// ---- Single Notification Item ----
const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const [markAsRead] = useMarkAsReadMutation();

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id).unwrap();
        onRead();
      } catch {
        // ignore
      }
    }

    // Navigate based on type
    if (notification.type === "follow") {
      navigate(`/profile/${notification.sender?.username}`);
    } else if (notification.post) {
      navigate(`/post/${notification.post?._id || notification.post}`);
    } else if (notification.type === "message") {
      navigate("/chat");
    }
  };

  return (
    <div
      className={`${styles.item} ${!notification.isRead ? styles.unread : ""}`}
      onClick={handleClick}
    >
      {/* Avatar with icon badge */}
      <div className={styles.avatarWrapper}>
        <Avatar
          src={notification.sender?.avatar?.url}
          alt={notification.sender?.username}
          size="md"
        />
        <NotificationIcon type={notification.type} />
      </div>

      {/* Text */}
      <div className={styles.content}>
        <p className={styles.text}>
          <span className={styles.username}>
            {notification.sender?.username}
          </span>{" "}
          {getNotificationText(notification)}
        </p>
        <p className={styles.timeAgo}>{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Post thumbnail */}
      {notification.post?.media?.[0] && (
        <img
          src={notification.post.media[0].url}
          alt="Post"
          className={styles.postThumb}
        />
      )}

      {/* Unread dot */}
      {!notification.isRead && <div className={styles.unreadDot} />}
    </div>
  );
};

// ---- Notifications Page ----
const NotificationsPage = () => {
  const dispatch = useDispatch();

  const { data, isLoading } = useGetNotificationsQuery({
    page: 1,
    limit: 50,
  });

  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.data?.notifications || [];

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      dispatch(resetUnreadCount());
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleRead = () => {
    dispatch(resetUnreadCount());
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
        {unreadNotifications.length > 0 && (
          <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <Bell size={56} strokeWidth={1} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No notifications yet</h3>
          <p>When people like or comment on your posts, you'll see it here</p>
        </div>
      ) : (
        <>
          {/* Unread */}
          {unreadNotifications.length > 0 && (
            <>
              <p className={styles.sectionLabel}>New</p>
              {unreadNotifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onRead={handleRead}
                />
              ))}
            </>
          )}

          {/* Read */}
          {readNotifications.length > 0 && (
            <>
              <p className={styles.sectionLabel}>Earlier</p>
              {readNotifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onRead={handleRead}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
