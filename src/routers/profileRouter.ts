import { Router } from "express";
import AuthController from "../controllers/authController";

const profileRouter = Router();

profileRouter.delete("/delete", AuthController.deleteAccount);

profileRouter.put("/update", AuthController.editUser);

profileRouter.get("/info", AuthController.getUserInfo);

export default profileRouter;
