import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from "@features/auth/authSlice.js";

const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  return { user, isAuthenticated, isLoading };
};

export default useAuth;
