import { Router } from "express";
import {
  getUserProfileController,
  updateProfileController,
  updateAvatarController,
  updateCoverController,
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
  searchUsersController,
  getFollowSuggestionsController,
} from "../controllers/userController.js";
import verifyJWT from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { uploadAvatar, uploadCover } from "../middlewares/uploadMiddleware.js";
import { updateProfileSchema } from "../validators/userValidator.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(verifyJWT);
router.use(apiLimiter);

router.route("/search").get(searchUsersController);
router.route("/suggestions").get(getFollowSuggestionsController);

// ---- Profile ----
router
  .route("/update-profile")
  .put(validateRequest(updateProfileSchema), updateProfileController);
router.route("/update-avatar").put(uploadAvatar, updateAvatarController);
router.route("/update-cover").put(uploadCover, updateCoverController);

// ---- Follow / Unfollow ----
router.route("/follow/:userId").post(followUserController);
router.route("/unfollow/:userId").post(unfollowUserController);

// ---- Followers & Following ----
router.route("/:userId/followers").get(getFollowersController);
router.route("/:userId/following").get(getFollowingController);

// ---- Get Profile by Username ----
router.route("/:username").get(getUserProfileController);

export default router;
