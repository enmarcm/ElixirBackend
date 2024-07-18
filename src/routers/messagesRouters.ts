import { Router } from "express";
import MessageController from "../controllers/messageController";

const messagesRouter = Router();

messagesRouter.get("/getAllChats/:page", MessageController.getAllChats);

messagesRouter.get(
  "/getMessages/:idChat/:page",
  MessageController.getMessageChat
);

messagesRouter.post("/addMessage", MessageController.addMessages);

export default messagesRouter;
