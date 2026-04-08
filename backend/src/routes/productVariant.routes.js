import { Router } from "express";
import productVariantController from "../controllers/productVariant.controller.js";

const router = Router();

router.get("/", productVariantController.getAll);
router.get("/:id", productVariantController.getOne);
router.post("/", productVariantController.create);
router.put("/:id", productVariantController.update);
router.delete("/:id", productVariantController.softDelete);

export default router;
