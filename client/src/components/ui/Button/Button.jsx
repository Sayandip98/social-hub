import styles from "./Button.module.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  isLoading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...rest
}) => {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    iconOnly ? styles.iconOnly : "",
    isLoading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading && (
        <span className={styles.loadingSpinner} aria-hidden="true" />
      )}
      {children}
    </button>
  );
};

export default Button;
