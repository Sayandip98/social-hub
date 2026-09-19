import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import MainLayout from "@/layouts/MainLayout/MainLayout.jsx";
import AuthLayout from "@/layouts/AuthLayout/AuthLayout.jsx";

// Pages
import LoginPage from "@pages/Auth/Login/LoginPage.jsx";
import RegisterPage from "@pages/Auth/Register/RegisterPage.jsx";
import FeedPage from "@pages/Feed/FeedPage.jsx";
import ProfilePage from "@pages/Profile/ProfilePage.jsx";
import PostDetailPage from "@pages/Post/PostDetailPage.jsx";
import SearchPage from "@pages/Search/SearchPage.jsx";
import NotificationsPage from "@pages/Notifications/NotificationsPage.jsx";
import ChatPage from "@pages/Chat/ChatPage.jsx";
import NotFoundPage from "@pages/NotFound/NotFoundPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ---- Public Routes ---- */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* ---- Protected Routes ---- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<FeedPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
        </Route>
      </Route>

      {/* ---- 404 ---- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
