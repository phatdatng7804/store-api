import { Router } from "express";
import authRoutes from "./auth.routes.js";
import storeRoutes from "./store.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", storeRoutes);

export default router;
