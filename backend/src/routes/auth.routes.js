import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

const router = Router();

// Middleware validate dùng Joi schema
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: "Dữ liệu không hợp lệ",
            details: error.details.map(d => d.message)
        });
    }
    next();
};

// POST /api/auth/register
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login
router.post("/login", validate(loginSchema), authController.login);

export default router;
