import { Router } from "express";
import { Request, Response } from "express";
import MessagesModelClass from "../models/MessagesModel";

const messagesRouter = Router();

messagesRouter.get(
  "/getAllChats/:page",
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

messagesRouter.get(
  "/getMessages/:idChat/:page",
  async (req: Request, res: Response) => {
    try {
      const { idChat, page } = req.params;
      const parsedPage = parseInt(page) || 1;

      const result = await MessagesModelClass.getMessageByChat({
        idChat,
        page: parsedPage,
      });

      return res.json(result);
    } catch (error) {
      console.error(`Hubo un error al obtener los mensajes: ${error}`);
      throw new Error(`Error getting messages: ${error}`);
    }
  }
);

messagesRouter.post("/addMessage", async (req: Request, res: Response) => {
  try {
    const { idUser } = req as any;
    const { idReceiver, content } = req.body;

    //Debemos validar que content, tenga esta estructura
    // {type: "text", content: "Hola", "message": string}

    const result = await MessagesModelClass.addMessage({
      idSender: idUser,
      idReceiver,
      content,
    });

    console.log(result);
    return res.json(result);
  } catch (error) {
    console.log(error);
    throw new Error(`Error adding message: ${error}`);
  }
});

export default messagesRouter;
