import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
} from "../services/authService.js";

const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  const { user, accessToken, refreshToken, cookieOptions } = await registerUser(
    { username, email, password, fullName },
  );

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(201, { user, accessToken }, "Registration successful"),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const { user, accessToken, refreshToken, cookieOptions } = await loginUser({
    email,
    username,
    password,
  });

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { user, accessToken }, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  const cookieOptions = await logoutUser(req.user._id);

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, newRefreshToken, cookieOptions } =
    await refreshAccessToken(incomingRefreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await changePassword(req.user._id, { oldPassword, newPassword });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: req.user }, "User fetched successfully"),
    );
});

export { register, login, logout, refreshToken, updatePassword, getMe };
