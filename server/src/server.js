import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import { initSocket } from "./sockets/index.js";

const server = http.createServer(app);

// --- Socket.io initialized  ---
const io = initSocket(server);

// Keep server alive on free tier — ping every 14 minutes
if (process.env.NODE_ENV === "production") {
    setInterval(async () => {
        try {
            await fetch(`${process.env.RENDER_EXTERNAL_URL}/api/health`);
            console.log("Keep-alive ping sent");
        } catch (e) {
            // ignore
        }
    }, 14 * 60 * 1000); // 14 minutes
}

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
