import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "@store/store.js";
import App from "./App.jsx";

// Global styles — order matters
import "@styles/variables.css";
import "@styles/reset.css";
import "@styles/global.css";
import "@styles/animations.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-family)",
            fontSize: "var(--font-size-base)",
          },
        }}
      />
    </Provider>
  </StrictMode>,
);
