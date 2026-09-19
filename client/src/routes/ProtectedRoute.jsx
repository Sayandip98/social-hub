import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@hooks/useAuth.js";
import { Spinner } from "@components/ui/index.js";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner size="xl" fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
