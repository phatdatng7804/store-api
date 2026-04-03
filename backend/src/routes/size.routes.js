import { Router } from "express";
import sizeController from "../controllers/size.controller.js";

const router = Router();

router.get("/", sizeController.getAll);
router.get("/:id", sizeController.getOne);
router.post("/", sizeController.create);
router.put("/:id", sizeController.update);
router.delete("/:id", sizeController.softDelete);

export default router;
