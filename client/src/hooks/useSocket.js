import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "@services/socket.js";
import {
  selectAccessToken,
  selectIsAuthenticated,
} from "@features/auth/authSlice.js";
import {
  addMessage,
  replaceOptimisticMessage,
  setTyping,
} from "@features/chat/chatSlice.js";
import { addRealtimeNotification } from "@features/notifications/notificationsSlice.js";

const useSocket = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current?.connected) return;

    const timer = setTimeout(() => {
      const socket = connectSocket(accessToken);
      socketRef.current = socket;

      // ---- New message received ----
      socket.on("message:new", ({ message, tempId }) => {
        // Get conversationId as string reliably
        const conversationId =
          typeof message.conversation === "object"
            ? message.conversation._id?.toString() ||
              message.conversation.toString()
            : message.conversation?.toString();

        if (!conversationId) return;

        if (tempId) {
          // Replace optimistic placeholder with real message
          dispatch(
            replaceOptimisticMessage({
              conversationId,
              tempId,
              message: { ...message, conversation: conversationId },
            }),
          );
        } else {
          // New message from other user — add directly
          dispatch(
            addMessage({
              conversationId,
              message: { ...message, conversation: conversationId },
            }),
          );
        }
      });

      // ---- Typing indicators ----
      socket.on("typing:start", ({ userId, conversationId }) => {
        dispatch(
          setTyping({
            conversationId,
            userId,
            isTyping: true,
          }),
        );
      });

      socket.on("typing:stop", ({ userId, conversationId }) => {
        dispatch(
          setTyping({
            conversationId,
            userId,
            isTyping: false,
          }),
        );
      });

      // ---- Real-time notifications ----
      socket.on("notification:new", (notification) => {
        dispatch(addRealtimeNotification(notification));
      });

      socket.on("connect_error", (err) => {
        console.error("Socket error:", err.message);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      disconnectSocket();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, dispatch]);

  return socketRef.current;
};

export default useSocket;
