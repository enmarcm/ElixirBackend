import { Router } from "express";
import { createSale, getSale, listSales } from "../controllers/salesController";

const salesRouter = Router();

salesRouter.get("/", listSales);
salesRouter.get("/:id", getSale);
salesRouter.post("/", createSale);

export default salesRouter;
