import { Router } from "express";
import {
  createPaymentMethod,
  deletePaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
} from "../controllers/paymentMethodsController";

const paymentMethodsRouter = Router();

paymentMethodsRouter.get("/", listPaymentMethods);
paymentMethodsRouter.post("/", createPaymentMethod);
paymentMethodsRouter.patch("/:id", updatePaymentMethod);
paymentMethodsRouter.delete("/:id", deletePaymentMethod);

export default paymentMethodsRouter;
