import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { limiter } from "../middlewares/rateLimit.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";

// Validation middleware
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ error: messages });
    }
    req.validatedData = value;
    next();
};

const router = Router();

// POST /api/auth/register
router.post("/register", limiter, authController.register);

// POST /api/auth/login
router.post("/login", limiter, authController.login);

// POST /api/auth/google
router.post("/google", limiter, authController.googleLogin);

// POST /api/auth/refresh-token
router.post("/refresh-token", limiter, authController.refreshToken);

// POST /api/auth/logout
router.post("/logout", authenticate, authController.logout);

export default router;
