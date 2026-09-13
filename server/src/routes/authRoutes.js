import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  updatePassword,
  getMe,
} from "../controllers/authController.js";
import verifyJWT from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../validators/authValidator.js";

const router = Router();

router
  .route("/register")
  .post(authLimiter, validateRequest(registerSchema), register);

router.route("/login").post(authLimiter, validateRequest(loginSchema), login);

router.route("/refresh-token").post(refreshToken);

router.route("/logout").post(verifyJWT, logout);

router
  .route("/change-password")
  .post(verifyJWT, validateRequest(changePasswordSchema), updatePassword);

router.route("/me").get(verifyJWT, getMe);

export default router;
