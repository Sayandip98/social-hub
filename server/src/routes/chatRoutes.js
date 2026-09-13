import { Router } from "express";
import {
  getOrCreateConversationController,
  getUserConversationsController,
  getConversationController,
  deleteConversationController,
  sendMessageController,
  getMessagesController,
  deleteMessageController,
  markAsSeenController,
} from "../controllers/chatController.js";
import verifyJWT from "../middlewares/authMiddleware.js";
import { uploadMessageMedia } from "../middlewares/uploadMiddleware.js";
import { apiLimiter, messageLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(verifyJWT);
router.use(apiLimiter);

router
  .route("/conversations")
  .get(getUserConversationsController)
  .post(getOrCreateConversationController);

router
  .route("/conversations/:conversationId")
  .get(getConversationController)
  .delete(deleteConversationController);

router
  .route("/conversations/:conversationId/messages")
  .get(getMessagesController)
  .post(messageLimiter, uploadMessageMedia, sendMessageController);
router.route("/conversations/:conversationId/seen").put(markAsSeenController);
router.route("/messages/:messageId").delete(deleteMessageController);

export default router;
