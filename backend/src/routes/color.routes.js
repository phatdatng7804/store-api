import { Router } from "express";
import colorController from "../controllers/color.controller.js";

const router = Router();

router.get("/", colorController.getAll);
router.get("/:id", colorController.getOne);
router.post("/", colorController.create);
router.put("/:id", colorController.update);
router.delete("/:id", colorController.softDelete);

export default router;
