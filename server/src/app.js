import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { CLIENT_URL } from "./config/env.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// --- Security ---
app.use(helmet());

// --- CORS ---
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

// --- Body Parsers ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Cookie Parser ---
app.use(cookieParser());

// --- Logger (only in development) ---
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --- Health Check Route ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// --- Error ---
app.use(errorMiddleware);

export default app;
