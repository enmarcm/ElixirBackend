import { Router } from "express";
import {
  createDeliveryMethod,
  deleteDeliveryMethod,
  listDeliveryMethods,
  updateDeliveryMethod,
} from "../controllers/deliveryMethodsController";

const deliveryMethodsRouter = Router();

deliveryMethodsRouter.get("/", listDeliveryMethods);
deliveryMethodsRouter.post("/", createDeliveryMethod);
deliveryMethodsRouter.patch("/:id", updateDeliveryMethod);
deliveryMethodsRouter.delete("/:id", deleteDeliveryMethod);

export default deliveryMethodsRouter;
