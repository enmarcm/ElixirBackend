import { Router } from "express";
import { root } from "../controllers/mainController";

const mainRouter = Router();

mainRouter.get("/", root);

export default mainRouter;
