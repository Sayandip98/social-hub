import { io } from "socket.io-client";
import { SOCKET_URL } from "@utils/constants.js";

let socket = null;

// ---- Connect Socket ----
export const connectSocket = (token) => {
  if (socket) socket.disconnect();

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket error:", error.message);
  });

  return socket;
};

// ---- Disconnect Socket ----
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ---- Get Socket Instance ----
export const getSocket = () => socket;

export default socket;
