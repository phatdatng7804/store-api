import { Router } from "express";
import authRoutes from "./auth.routes.js";
import storeRoutes from "./store.routes.js";
import chatbotRoutes from "./chatbot.routes.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/reviews", reviewRoutes);
router.use("/", storeRoutes);

export default router;
