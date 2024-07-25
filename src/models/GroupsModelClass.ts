import { GroupMessageModel, GroupModel, UserModel } from "../typegoose/models";
import { ITSGooseHandler } from "../data/instances";

export default class GroupModelClass {
  static async getAllGroupsUser(idUser: string) {
    try {
      const results = await ITSGooseHandler.searchAll({
        Model: GroupModel,
        condition: { idUserOwner: idUser },
      });

      //Ahora obtenemos el ultimo mensaje de ese grupo
      const resultWithLastMessage = await Promise.all(
        results.map(async (group: any) => {
          const lastMessage = await ITSGooseHandler.searchOne({
            Model: GroupMessageModel,
            condition: { idGroup: group.id },
          });

          return {
            ...group,
            lastMessage,
          };
        })
      );

      const lastMessageAndUser = await Promise.all(
        resultWithLastMessage.map(async (group: any) => {
          const user = await ITSGooseHandler.searchOne({
            Model: UserModel,
            condition: { _id: group.idUserOwner },
          });

          return {
            ...group,
            userLastMessage: user,
          };
        })
      );

      return lastMessageAndUser;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static async obtainGroupMessages(idGroup: string) {
    try {
      const results = await ITSGooseHandler.searchAll({
        Model: GroupMessageModel,
        condition: { idGroup },
      });

      const resultsWithUsers = await Promise.all(
        results.map(async (message: any) => {
          const user = await ITSGooseHandler.searchOne({
            Model: UserModel,
            condition: { _id: message.idUser },
          });

          return {
            ...message,
            user,
          };
        })
      );

      return resultsWithUsers;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static async getGroupById(idGroup: string) {
    try {
      const result = await ITSGooseHandler.searchOne({
        Model: GroupModel,
        condition: { _id: idGroup },
      });

      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static async createGroup({
    name,
    description,
    image = "https://icones.pro/wp-content/uploads/2021/03/icone-de-groupe-symbole-png-vert.png",
    idUserOwner,
    idUsers,
  }: {
    name: string;
    description: string;
    image?: string;
    idUserOwner: string;
    idUsers: string[];
  }) {
    try {
      const newIdUsers = [...idUsers, idUserOwner];

      const newGroup = await ITSGooseHandler.addDocument({
        Model: GroupModel,
        data: { name, description, image, idUserOwner, idUsers: newIdUsers },
      });

      return newGroup;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static async deleteGroup(groupId: string) {
    try {
      const result = await ITSGooseHandler.removeDocument({
        Model: GroupModel,
        id: groupId,
      });

      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
