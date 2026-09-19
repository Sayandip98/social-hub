import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@hooks/useAuth.js";
import { Spinner } from "@components/ui/index.js";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner size="xl" fullPage />;
  }

  // Redirect to feed if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
