import {
  ChatModel,
  ChatMessageModel,
  MessageModel,
  UserModel,
} from "../typegoose/models";
import { ITSGooseHandler } from "../data/instances";

export default class MessagesModelClass {
  static addMessage = async ({
    idSender,
    idReceiver,
    content,
    idChatSender,
  }: {
    idSender: string;
    idReceiver: string;
    content: any;
    idChatSender: string;
  }) => {
    try {
      //Primero vamos a agregar a la coleccion de mensajes
      const newMessage = {
        idUserSender: idSender,
        idUserReceiver: idReceiver,
        content,
        date: new Date(),
        read: false,
      };

      const resultMessageDB = await ITSGooseHandler.addDocument({
        Model: MessageModel,
        data: newMessage,
      });

      //Luego vamos a buscar en chats donde idUser = idSender y idUserSender = idReceiver o viceversa
      const CONDITION_CHAT_RECEIVER = {
        $or: [{ idUser: idReceiver, idUserSender: idSender }],
      };

      const chatReceiverData = await ITSGooseHandler.searchOne({
        Model: ChatModel,
        condition: CONDITION_CHAT_RECEIVER,
      });

      console.log(chatReceiverData);

      //Si no existe el chat en el receptor lo creamos
      const dataNullChatReceiver =
        chatReceiverData.length === 0 || !chatReceiverData;

      const resultCreateChatReceiver = dataNullChatReceiver
        ? await ITSGooseHandler.addDocument({
            Model: ChatModel,
            data: {
              idUser: idReceiver,
              idUserSender: idSender,
              lastMessage: resultMessageDB,
            },
          })
        : chatReceiverData;

      console.log("Este fue el documento generado: ", resultCreateChatReceiver);

      //Al encontrar los chats de cada uno vamos a agregar el mensaje a cada chat
      const addMessageToChatSender = await ITSGooseHandler.addDocument({
        Model: ChatMessageModel,
        data: {
          idChat: idChatSender,
          idMessage: resultMessageDB.id,
          idUser: idSender,
        },
      });

      const addMessageToChatReceiver = await ITSGooseHandler.addDocument({
        Model: ChatMessageModel,
        data: {
          idChat: resultCreateChatReceiver.id,
          idMessage: resultMessageDB.id,
          idUser: idSender,
        },
      });

      console.log(addMessageToChatSender, addMessageToChatReceiver);
    } catch (error) {
      console.error(`Hubo un error al agregar el mensaje: ${error}`);
      throw new Error(`Error adding message: ${error}`);
    }
  };

  static getMessageByChat = async ({
    idChat,
    page = 1,
  }: {
    idChat: string;
    page?: number;
  }) => {
    try {
      const LIMIT_PAGE_MESSAGE = 50;

      // Step 1: Verify that the chat really exists
      const chat = await ChatModel.findById(idChat);
      if (!chat) {
        throw new Error(`Chat with id ${idChat} does not exist`);
      }

      const messages = await ITSGooseHandler.searchAll({
        Model: ChatMessageModel,
        condition: { idChat },
        limit: LIMIT_PAGE_MESSAGE,
        offset: (page - 1) * LIMIT_PAGE_MESSAGE,
      });

      console.log(`Los mensajes del chat ${idChat} son: ${messages}`);
      return messages;
    } catch (error) {
      console.error(`Hubo un error al obtener los mensajes: ${error}`);
      throw new Error(`Error getting messages: ${error}`);
    }
  };

  static gettAllChatsByUser = async ({
    idUser,
    page = 1,
  }: {
    idUser: string;
    page: number;
  }) => {
    try {
      const LIMIT_PAGE_CHAT = 15;

      const chats = (await ITSGooseHandler.searchAll({
        Model: ChatModel,
        condition: { idUser },
        limit: LIMIT_PAGE_CHAT,
        offset: (page - 1) * LIMIT_PAGE_CHAT,
      })) as any;

      const chatsWithLastMessage = await Promise.all(
        chats.map(async (chat: any) => {
          const lastMessage = await ITSGooseHandler.searchOne({
            Model: ChatMessageModel,
            condition: { idChat: chat.id },
            transform: { idMessage: -1 },
          });

          return {
            ...chat,
            lastMessage,
          };
        })
      );

      const chatsWithLastMessageAndUser = await Promise.all(
        chatsWithLastMessage.map(async (chat: any) => {

          const userLastMessage = await ITSGooseHandler.searchOne({
            Model: UserModel,
            condition: { id: chat.lastMessage.idUser },
          });

          return {
            ...chat,
            userLastMessage,
          };
        })
      );

      return chatsWithLastMessageAndUser;
    } catch (error) {
      console.error(`Hubo un error al obtener los chats: ${error}`);
      throw new Error(`Error getting chats: ${error}`);
    }
  };
}
