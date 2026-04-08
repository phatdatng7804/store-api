import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
     windowMs: 60 * 1000, // 1 phút
  max: 100,
  message: {
    status: 429,
    message: "Too many requests, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});