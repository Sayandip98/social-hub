import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes.jsx";
import { useDispatch } from "react-redux";
import { getMe } from "@features/auth/authSlice.js";
import { ThemeProvider } from "@context/ThemeContext.jsx";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // On app load — restore user session if token exists
    dispatch(getMe());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
