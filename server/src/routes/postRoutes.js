import { Router } from "express";
import {
  createPostController,
  getFeedController,
  getBookmarksController,
  getUserPostsController,
  getPostController,
  updatePostController,
  deletePostController,
  likePostController,
  unlikePostController,
  getPostLikesController,
  bookmarkPostController,
} from "../controllers/postController.js";
import verifyJWT from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { uploadPostMedia } from "../middlewares/uploadMiddleware.js";
import {
  createPostSchema,
  updatePostSchema,
} from "../validators/postValidator.js";
import { postLimiter, apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(verifyJWT);
router.use(apiLimiter);

router.route("/feed").get(getFeedController);
router.route("/bookmarks").get(getBookmarksController);
router.route("/user/:userId").get(getUserPostsController);

router
  .route("/")
  .post(
    postLimiter,
    uploadPostMedia,
    validateRequest(createPostSchema),
    createPostController,
  );
router
  .route("/:postId")
  .get(getPostController)
  .put(validateRequest(updatePostSchema), updatePostController)
  .delete(deletePostController);
router.route("/:postId/like").post(likePostController);
router.route("/:postId/unlike").post(unlikePostController);
router.route("/:postId/likes").get(getPostLikesController);
router.route("/:postId/bookmark").post(bookmarkPostController);

export default router;
