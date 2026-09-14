import { formatDistanceToNow, format, isThisYear } from "date-fns";

// "2 hours ago", "3 days ago"
export const timeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// "Jan 15" or "Jan 15, 2023" if not this year
export const formatPostDate = (date) => {
  const d = new Date(date);
  if (isThisYear(d)) {
    return format(d, "MMM d");
  }
  return format(d, "MMM d, yyyy");
};

// "January 15, 2024"
export const formatFullDate = (date) => {
  return format(new Date(date), "MMMM d, yyyy");
};

// "2:30 PM"
export const formatTime = (date) => {
  return format(new Date(date), "h:mm a");
};

// "Jan 15, 2:30 PM"
export const formatDateTime = (date) => {
  return format(new Date(date), "MMM d, h:mm a");
};
