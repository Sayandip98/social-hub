import { Router } from "express";
import {
  getNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
  clearAllController,
  deleteNotificationController,
} from "../controllers/notificationController.js";
import verifyJWT from "../middlewares/authMiddleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(verifyJWT);
router.use(apiLimiter);

router.route("/unread-count").get(getUnreadCountController);
router.route("/read-all").put(markAllAsReadController);
router.route("/clear-all").delete(clearAllController);
router.route("/").get(getNotificationsController);

router.route("/:notificationId/read").put(markAsReadController);
router.route("/:notificationId").delete(deleteNotificationController);

export default router;
