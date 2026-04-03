import { Router } from "express";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import productVariantRoutes from "./productVariant.routes.js";
import colorRoutes from "./color.routes.js";
import sizeRoutes from "./size.routes.js";

const router = Router();

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/product-variants", productVariantRoutes);
router.use("/colors", colorRoutes);
router.use("/sizes", sizeRoutes);

export default router;
