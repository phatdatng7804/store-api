import { Router } from "express";
import productController from "../controllers/product.controller.js";

const router = Router();

router.get("/", productController.getAll);
router.get("/:id", productController.getOne);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.softDelete);

export default router;
