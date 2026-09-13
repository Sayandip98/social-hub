const registerNotificationSocket = (io, socket, onlineUsers) => {
  const userId = socket.user._id.toString();

  // ---- Send Notification to Specific User ----
  socket.on("notification:send", async ({ receiverId, notification }) => {
    if (!receiverId || !notification) return;

    const isOnline = onlineUsers.has(receiverId.toString());

    if (isOnline) {
      io.to(receiverId.toString()).emit("notification:new", notification);
    }
  });

  // ---- User Starts Viewing Notifications ----
  socket.on("notifications:viewed", () => {
    socket.to(userId).emit("notifications:badge:reset");
  });
};

// ---- Standalone Emitter ----

const emitNotification = (io, receiverId, notification) => {
  if (!io || !receiverId || !notification) return;

  // Emit to receiver's personal room
  io.to(receiverId.toString()).emit("notification:new", notification);
};

export { registerNotificationSocket, emitNotification };
