import { Router } from "express";
import { Request, Response } from "express";
import MessagesModelClass from "../models/MessagesModel";

const messagesRouter = Router();

messagesRouter.get(
  "/getAllMessages/:page",
  async (req: Request, res: Response) => {
    try {
      const { idUser } = req as any;
      const page = parseInt(req.params.page) || 1;

      const result = await MessagesModelClass.gettAllChatsByUser({
        idUser,
        page,
      });

      return res.json(result);
    } catch (error) {
      console.error(`Hubo un error al obtener los mensajes: ${error}`);
      throw new Error(`Error getting messages: ${error}`);
    }
  }
);

export default messagesRouter;
