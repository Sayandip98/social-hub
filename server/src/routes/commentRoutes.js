import { Router } from "express";
import {
  addCommentController,
  getPostCommentsController,
  deleteCommentController,
  likeCommentController,
  unlikeCommentController,
  replyToCommentController,
  getCommentRepliesController,
} from "../controllers/commentController.js";
import verifyJWT from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  createCommentSchema,
  replyCommentSchema,
} from "../validators/commentValidator.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(verifyJWT);
router.use(apiLimiter);

router
  .route("/:postId")
  .post(validateRequest(createCommentSchema), addCommentController)
  .get(getPostCommentsController);

router.route("/:commentId/like").post(likeCommentController);
router.route("/:commentId/unlike").post(unlikeCommentController);
router
  .route("/:commentId/reply")
  .post(validateRequest(replyCommentSchema), replyToCommentController);
router.route("/:commentId/replies").get(getCommentRepliesController);

router.route("/:commentId").delete(deleteCommentController);

export default router;
