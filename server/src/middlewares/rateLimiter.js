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

export const authLimiter = createRateLimiter(
  15,
  10,
  "Too many attempts, please try again after 15 minutes",
);

export const apiLimiter = createRateLimiter(
  15,
  100,
  "Too many requests, please try again after 15 minutes",
);

export const postLimiter = createRateLimiter(
  60,
  20,
  "Post limit reached, please try again after an hour",
);

export const messageLimiter = createRateLimiter(
  1,
  60,
  "Slow down, too many messages",
);
