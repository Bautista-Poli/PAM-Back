import { Router } from "express";
import { getProductsController } from "../controllers/get.products.controller";
import { postProductController } from "../controllers/post.products.controller";
const router = Router();

router.get("/", getProductsController);
router.post("/", postProductController);

export default router;