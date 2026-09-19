import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Bell,
  PlusSquare,
  PlusCircle,
  User,
  LogOut,
  Sun,
  Moon,
  MoreHorizontal,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@components/ui/index.js";
import { clearCredentials } from "@features/auth/authSlice.js";
import { useLogoutMutation } from "@features/auth/authAPI.js";
import { useGetUnreadCountQuery } from "@features/notifications/notificationsAPI.js";
import { useTheme } from "@context/ThemeContext.jsx";
import useAuth from "@hooks/useAuth.js";
import CreatePostModal from "@features/posts/components/CreatePostModal/CreatePostModal.jsx";
import CreateStoryModal from "@features/stories/components/CreateStoryModal/CreateStoryModal.jsx";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000, // check every 30 seconds
  });

  const unreadCount = unreadData?.data?.unreadCount || 0;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // ignore logout errors
    } finally {
      dispatch(clearCredentials());
      navigate("/login");
    }
  };

  const navItems = [
    { to: "/", icon: <Home size={26} />, label: "Home" },
    { to: "/search", icon: <Search size={26} />, label: "Search" },
    { to: "/explore", icon: <Compass size={26} />, label: "Explore" },
    { to: "/reels", icon: <Film size={26} />, label: "Reels" },
    { to: "/chat", icon: <MessageCircle size={26} />, label: "Messages" },
    {
      to: "/notifications",
      icon: <Bell size={26} />,
      label: "Notifications",
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      to: `/profile/${user?.username}`,
      icon: <User size={26} />,
      label: "Profile",
    },
  ];

  return (
    <>
      <div className={styles.sidebar}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoText}>
            Social<span className={styles.logoAccent}>Hub</span>
          </span>
        </NavLink>

        {/* Navigation */}
        <nav className={styles.nav}>
          {/* Create Post Button */}
          <button
            className={`${styles.navItem} ${styles.createBtn}`}
            onClick={() => setIsCreatePostOpen(true)}
          >
            <span className={styles.navIcon}>
              <PlusSquare size={26} />
            </span>
            <span className={styles.navLabel}>Create</span>
          </button>

          {/* Create Story Button */}
          <button
            className={styles.navItem}
            onClick={() => setIsCreateStoryOpen(true)}
          >
            <span className={styles.navIcon}>
              <PlusCircle size={26} />
            </span>
            <span className={styles.navLabel}>Story</span>
          </button>

          {/* Nav Links */}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge && (
                <span className={styles.badge}>
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          <Dropdown
            isOpen={isMoreOpen}
            onClose={() => setIsMoreOpen(false)}
            placement="topRight"
            trigger={
              <div
                className={styles.userCard}
                onClick={() => setIsMoreOpen(!isMoreOpen)}
              >
                <Avatar
                  src={user?.avatar?.url}
                  alt={user?.fullName || user?.username}
                  size="sm"
                />
                <div className={styles.userInfo}>
                  <p className={styles.userName}>
                    {user?.fullName || user?.username}
                  </p>
                  <p className={styles.userUsername}>@{user?.username}</p>
                </div>
                <span className={styles.moreBtn}>
                  <MoreHorizontal size={20} />
                </span>
              </div>
            }
          >
            <DropdownItem
              icon={theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              onClick={() => {
                toggleTheme();
                setIsMoreOpen(false);
              }}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </DropdownItem>

            <DropdownDivider />

            <DropdownItem
              icon={<LogOut size={16} />}
              danger
              onClick={handleLogout}
            >
              Log Out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />
    </>
  );
};

export default Sidebar;
