import { Router } from "express";
import {
  getPaymentBalances,
  getSummary,
} from "../controllers/dashboardController";

const dashboardRouter = Router();

dashboardRouter.get("/summary", getSummary);
dashboardRouter.get("/payment-balances", getPaymentBalances);

export default dashboardRouter;
