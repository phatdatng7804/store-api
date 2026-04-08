import { Router } from "express";
<<<<<<< HEAD
import authRoutes from "./auth.routes.js";
import storeRoutes from "./store.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", storeRoutes);
=======
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
>>>>>>> bf292fd2b335bd508bcdba3d65c5f66857686a09

export default router;
