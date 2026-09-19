import { Outlet } from "react-router-dom";
import Sidebar from "@components/common/Sidebar/Sidebar.jsx";
import useSocket from "@hooks/useSocket.js";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
  // Initialize socket connection for authenticated users
  useSocket();

  return (
    <div className={styles.layout}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
