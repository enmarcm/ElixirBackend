import { Router } from "express";
import ContactController from "../controllers/contactController";

const contactRouter = Router();

contactRouter.get("/getAllContacts", ContactController.getAllContacts);

contactRouter.post("/addContact", ContactController.addContact);

export default contactRouter;
