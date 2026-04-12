import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/productsController";
import { uploadProductImage } from "../middlewares/upload";

const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.get("/:id", getProduct);
productsRouter.post("/", uploadProductImage.single("image"), createProduct);
productsRouter.patch("/:id", uploadProductImage.single("image"), updateProduct);
productsRouter.delete("/:id", deleteProduct);

export default productsRouter;
