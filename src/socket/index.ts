import { Server } from "socket.io";
import { IJWTManager } from "../data/instances";
import UserModelClass from "../models/UserModelClass";
import { GenerateTokenData } from "../types";

interface UserSocketMap {
  [userId: string]: string;
}

const userSocketMap: UserSocketMap = {};

export const configureSocket = (io: Server) => {
  console.log("cree el socket");

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

        // console.log(socket.data)

        userSocketMap[user.id] = socket.id;

        // console.log(
        //   `User ${user.id} registered with socket ID ${socket.id} via register event`
        // );

        socket.emit("registered", `User ${user.id} successfully registered`);
      } catch (error) {
        console.error(error);
        socket.emit("error", "An error occurred during registration");
      }
    });

    socket.on("privateMessage", ({ sender, receiver, message, type="text" }) => {

      
      console.log(`Los datos son: ${sender}, ${receiver}, ${message}`)

      const receiverSocketId = userSocketMap[receiver];
      if (receiverSocketId) {

        //Quiero enviar tambien los datos del usuario que envia el mensaje, como userName e imagen, que estan guardados en el mapa, sacarlos de ahi
        const dataSend = {
          sender,
          message: {
            type,
            content: message,
          },
          date: new Date().toISOString(),
          senderData: {
            userName: socket.data.userName,
            email: socket.data.email,
          },
        }


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

// import { Server } from "socket.io";

// interface UserSocketMap {
//   [userId: string]: string;
// }

// const userSocketMap: UserSocketMap = {};

// export const configureSocket = (io: Server) => {
//   console.log('cree el socket');

//   io.on("connection", (socket) => {
//     console.log("New client connected");

//     // Almacenar el ID del socket junto con el identificador del usuario
//     socket.on("register", (userId) => {
//       userSocketMap[userId] = socket.id;
//       console.log(`User ${userId} registered with socket ID ${socket.id}`);
//     });

//     socket.on("privateMessage", ({ sender, receiver, message }) => {
//       const receiverSocketId = userSocketMap[receiver];
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("privateMessage", { sender, message });
//       } else {
//         console.log(`User ${receiver} is not connected`);
//       }
//     });

//     socket.on("joinGroup", (group) => {
//       socket.join(group);
//     });

//     socket.on("groupMessage", ({ group, sender, message }) => {
//       io.to(group).emit("groupMessage", { sender, message });
//     });

//     socket.on("disconnect", () => {
//       console.log("Client disconnected");
//       // Eliminar el ID del socket del mapa cuando el usuario se desconecta
//       for (const userId in userSocketMap) {
//         if (userSocketMap[userId] === socket.id) {
//           delete userSocketMap[userId];
//           break;
//         }
//       }
//     });
//   });
// };
