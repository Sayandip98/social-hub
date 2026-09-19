import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Avatar } from "@components/ui/index.js";
import { useViewStoryMutation } from "@features/stories/storiesAPI.js";
import { timeAgo } from "@utils/formatDate.js";
import styles from "./StoryViewer.module.css";

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer = ({ group, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const [viewStory] = useViewStoryMutation();

  const stories = group.stories;
  const currentStory = stories[currentIndex];

  // ---- Auto advance ----
  useEffect(() => {
    setProgress(0);

    // Mark as viewed
    if (currentStory) {
      viewStory(currentStory._id);
    }

    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= STORY_DURATION) {
        goNext();
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  if (!currentStory) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Progress Bars */}
        <div className={styles.progressBars}>
          {stories.map((_, i) => (
            <div key={i} className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${
                  i < currentIndex
                    ? styles.completed
                    : i === currentIndex
                      ? styles.active
                      : ""
                }`}
                style={{
                  animationDuration:
                    i === currentIndex ? `${STORY_DURATION}ms` : undefined,
                  width:
                    i === currentIndex
                      ? `${progress}%`
                      : i < currentIndex
                        ? "100%"
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <Avatar
              src={group.user.avatar?.url}
              alt={group.user.username}
              size="sm"
            />
            <div>
              <p className={styles.username}>{group.user.username}</p>
              <p className={styles.timeAgo}>
                {timeAgo(currentStory.createdAt)}
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Media */}
        {currentStory.media.mediaType === "video" ? (
          <video
            src={currentStory.media.url}
            className={styles.media}
            autoPlay
            muted
            playsInline
          />
        ) : (
          <img
            src={currentStory.media.url}
            alt="Story"
            className={styles.media}
          />
        )}

        {/* Text Overlay */}
        {currentStory.text && (
          <p className={styles.textOverlay}>{currentStory.text}</p>
        )}

        {/* Navigation Areas */}
        <div className={styles.navLeft} onClick={goPrev} />
        <div className={styles.navRight} onClick={goNext} />
      </div>
    </div>
  );
};

export default StoryViewer;
