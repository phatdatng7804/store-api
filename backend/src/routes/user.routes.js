import { Router } from "express";
import userController from "../controllers/user.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from "../validations/user.validation.js";

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

router.use(authenticate);

router.put("/profile", validate(updateProfileSchema), userController.updateProfile);

router.post("/addresses", validate(createAddressSchema), userController.createAddress);
router.get("/addresses", userController.getAddresses);
router.put("/addresses/:id", validate(updateAddressSchema), userController.updateAddress);
router.delete("/addresses/:id", userController.deleteAddress);

export default router;
