import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_ACCESS_SECRET, CLIENT_URL } from "../config/env.js";
import { registerChatSocket } from "./chatSocket.js";
import { registerNotificationSocket } from "./notificationSocket.js";

const onlineUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
    },
    transports        : ["websocket", "polling"],
    allowEIO3         : true,
    pingTimeout       : 60000,
    pingInterval      : 25000,
    upgradeTimeout    : 30000,
    allowUpgrades     : true
  });

  // ---- Auth Middleware for Socket ----
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

      const user = await User.findById(decoded._id).select(
        "-password -refreshToken",
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      if (!user.isActive) {
        return next(new Error("Account deactivated"));
      }

      socket.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new Error("Token expired"));
      }
      return next(new Error("Authentication failed"));
    }
  });

  // ---- Connection Handler ----
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    socket.join(userId);

    onlineUsers.set(userId, socket.id);

    socket.broadcast.emit("user:online", { userId });

    socket.emit("users:online", {
      onlineUsers: [...onlineUsers.keys()],
    });

    // ---- Register Feature Handlers ----
    registerChatSocket(io, socket, onlineUsers);
    registerNotificationSocket(io, socket, onlineUsers);

    // ---- Disconnect Handler ----
    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.user.username} — ${reason}`);

      onlineUsers.delete(userId);

      socket.broadcast.emit("user:offline", { userId });
    });

    // ---- Error Handler ----
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.user.username}:`, error);
    });
  });

  return io;
};

export { initSocket, onlineUsers };
