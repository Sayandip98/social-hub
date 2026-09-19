import { forwardRef } from "react";
import styles from "./Input.module.css";

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = "text",
      isTextarea = false,
      className = "",
      id,
      ...rest
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const wrapperClasses = [
      styles.wrapper,
      error ? styles.error : "",
      leftIcon ? styles.hasLeftIcon : "",
      rightIcon ? styles.hasRightIcon : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

          {isTextarea ? (
            <textarea
              id={inputId}
              ref={ref}
              className={`${styles.input} ${styles.textarea}`}
              {...rest}
            />
          ) : (
            <input
              id={inputId}
              type={type}
              ref={ref}
              className={styles.input}
              {...rest}
            />
          )}

          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>

        {error && (
          <span className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}

        {hint && !error && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
