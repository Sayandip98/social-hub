import rateLimit from "express-rate-limit";

const createRateLimiter = (windowMinutes, maxRequests, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const isDev = process.env.NODE_ENV !== "production";

export const authLimiter = createRateLimiter(
  15,
  isDev ? 1000 : 10,
  "Too many attempts, please try again after 15 minutes",
);

export const apiLimiter = createRateLimiter(
  15,
  isDev ? 5000 : 100,
  "Too many requests, please try again after 15 minutes",
);

export const postLimiter = createRateLimiter(
  60,
  isDev ? 500 : 20,
  "Post limit reached, please try again after an hour",
);

export const messageLimiter = createRateLimiter(
  1,
  isDev ? 600 : 60,
  "Slow down, too many messages",
);
