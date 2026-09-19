import { useState } from "react";
import styles from "./Avatar.module.css";

const Avatar = ({
  src,
  alt = "User avatar",
  size = "md",
  hasStory = false,
  storyViewed = false,
  isOnline = false,
  onClick,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  // Get initials from alt text as fallback
  const initials = alt
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  const classes = [
    styles.avatar,
    styles[size],
    hasStory && !storyViewed ? styles.hasStory : "",
    storyViewed ? styles.storyViewed : "",
    onClick ? styles.clickable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className={styles.fallback}>{initials || "?"}</span>
      )}

      {isOnline && (
        <span className={styles.onlineIndicator} aria-label="Online" />
      )}
    </div>
  );
};

export default Avatar;
