import styles from "./Spinner.module.css";

// ---- Spinner ----
export const Spinner = ({ size = "md", fullPage = false, className = "" }) => {
  const wrapperClass = [
    styles.wrapper,
    fullPage ? styles.fullPage : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass} role="status" aria-label="Loading">
      <div className={`${styles.spinner} ${styles[size]}`} />
    </div>
  );
};

// ---- Skeleton ----
export const Skeleton = ({
  width = "100%",
  height = "16px",
  circle = false,
  className = "",
}) => {
  const classes = [
    styles.skeleton,
    circle ? styles.skeletonCircle : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{ width, height, borderRadius: circle ? "50%" : undefined }}
      aria-hidden="true"
    />
  );
};

// ---- Post Card Skeleton ----
export const PostSkeleton = () => (
  <div
    style={{
      padding: "var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
    }}
  >
    <div
      style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
    >
      <Skeleton circle width="40px" height="40px" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <Skeleton width="140px" height="14px" />
        <Skeleton width="80px" height="12px" />
      </div>
    </div>
    <Skeleton width="100%" height="300px" />
    <Skeleton width="60%" height="14px" />
    <Skeleton width="40%" height="12px" />
  </div>
);
