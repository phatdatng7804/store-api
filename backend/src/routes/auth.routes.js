import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const router = Router();

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

export default router;
