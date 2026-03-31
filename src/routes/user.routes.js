import { Router } from "express";
import userController from "../controllers/user.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import { updateProfileSchema } from "../validations/user.validation.js";

const router = Router();

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

// PUT /api/users/profile — phải đăng nhập, chỉ sửa được chính mình
router.put("/profile", authenticate, validate(updateProfileSchema), userController.updateProfile);

export default router;
