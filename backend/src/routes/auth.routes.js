import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "../validations/auth.validation.js";
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
router.post("/register", limiter, validate(registerSchema), authController.register);

// POST /api/auth/login
router.post("/login", limiter, validate(loginSchema), authController.login);

// POST /api/auth/refresh-token
router.post("/refresh-token", limiter, validate(refreshTokenSchema), authController.refreshToken);

// POST /api/auth/logout
router.post("/logout", authenticate, authController.logout);

export default router;
