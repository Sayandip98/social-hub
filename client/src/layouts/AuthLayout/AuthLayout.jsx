import { Outlet, Link } from "react-router-dom";
import styles from "./AuthLayout.module.css";
import { APP_NAME } from "@utils/constants.js";

const AuthLayout = () => {
  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link to="/login">
            <h1 className={styles.logoText}>
              Social<span className={styles.logoAccent}>Hub</span>
            </h1>
          </Link>
        </div>

        {/* Page content (Login or Register) */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
