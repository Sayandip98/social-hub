import { Router } from "express";
import {
  createStoryController,
  getStoryFeedController,
  getUserStoriesController,
  viewStoryController,
  getStoryViewersController,
  deleteStoryController,
} from "../controllers/storyController.js";
import verifyJWT from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { uploadStoryMedia } from "../middlewares/uploadMiddleware.js";
import { createStorySchema } from "../validators/storyValidator.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(verifyJWT);
router.use(apiLimiter);

router.route("/feed").get(getStoryFeedController);
router.route("/user/:userId").get(getUserStoriesController);
router
  .route("/")
  .post(
    uploadStoryMedia,
    validateRequest(createStorySchema),
    createStoryController,
  );

router.route("/:storyId/view").post(viewStoryController);
router.route("/:storyId/viewers").get(getStoryViewersController);
router.route("/:storyId").delete(deleteStoryController);

export default router;
