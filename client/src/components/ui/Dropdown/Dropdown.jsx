import { useEffect, useRef } from "react";
import styles from "./Dropdown.module.css";

const Dropdown = ({
  trigger,
  isOpen,
  onClose,
  children,
  placement = "bottomRight",
  className = "",
}) => {
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {trigger}
      {isOpen && (
        <div
          className={`${styles.menu} ${styles[placement]} ${className}`}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ---- Dropdown Item ----
export const DropdownItem = ({
  children,
  onClick,
  icon,
  danger = false,
  className = "",
}) => (
  <button
    className={`${styles.item} ${danger ? styles.danger : ""} ${className}`}
    onClick={onClick}
    role="menuitem"
  >
    {icon && icon}
    {children}
  </button>
);

// ---- Dropdown Divider ----
export const DropdownDivider = () => (
  <div className={styles.divider} role="separator" />
);

export default Dropdown;
