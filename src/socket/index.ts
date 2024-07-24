import { Server } from "socket.io";
import { IJWTManager } from "../data/instances";
import UserModelClass from "../models/UserModelClass";
import { GenerateTokenData } from "../types";

interface UserSocketMap {
  [userId: string]: string;
}

const userSocketMap: UserSocketMap = {};

export const configureSocket = (io: Server) => {
  // console.log("cree el socket");

  io.on("connection", (socket) => {
    socket.on("register", async (token: string) => {
      try {
        if (!token || !token.toLowerCase().startsWith("bearer")) {
          socket.emit("error", "Token not found");
          return;
        }

        const cleanedToken = token.replace("Bearer ", "");
        const decodedToken = IJWTManager.verifyToken(
          cleanedToken
        ) as GenerateTokenData;

        if (!cleanedToken || !decodedToken.id) {
          socket.emit("error", "Token not found");
          return;
        }

        const user = (await UserModelClass.searchUserId({
          id: decodedToken.id,
        })) as any;

        if (!user) {
          socket.emit("error", "User not found");
          return;
        }

        socket.data.idUser = user.id;
        socket.data.userName = user.userName;
        socket.data.email = user.email;
        socket.data.image = user?.image;
        socket.data.role = user.role;


        userSocketMap[user.id] = socket.id;


        socket.emit("registered", `User ${user.id} successfully registered`);
      } catch (error) {
        console.error(error);
        socket.emit("error", "An error occurred during registration");
      }
    });

    socket.on("privateMessage", ({ sender, receiver, message }) => {

      const receiverSocketId = userSocketMap[receiver];
      if (receiverSocketId) {


        const dataSend = {
          sender,
          message,
          date: new Date().toISOString(),
          senderData: {
            userName: socket.data.userName,
            email: socket.data.email,
          },
        }

        console.log('Mensaje recibido en socket')
        console.log(message)


        io.to(receiverSocketId).emit("privateMessage", dataSend);
      } else {
        console.log(`User ${receiver} is not connected`);
      }
    });

    socket.on("joinGroup", (group) => {
      socket.join(group);
    });

    socket.on("groupMessage", ({ group, sender, message }) => {
      io.to(group).emit("groupMessage", { sender, message });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      // Eliminar el ID del socket del mapa cuando el usuario se desconecta
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
    });
  });
};

