import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import { initSocket } from "./sockets/index.js";

const server = http.createServer(app);

// --- Socket.io initialized  ---
const io = initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { server, io };
