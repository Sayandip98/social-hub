import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} from "../config/env.js";

const generateAccessToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }, // 15 minutes
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }, // 7 days
  );
};

const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

export { generateAccessToken, generateRefreshToken, generateTokens };
