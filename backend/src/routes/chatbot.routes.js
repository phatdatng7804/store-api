import { Router } from "express";
import { chat } from "../controllers/chatbot.controller.js";
import { limiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

// POST /api/chatbot
router.post("/", limiter, chat);

export default router;
