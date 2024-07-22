import { ITSGooseHandler } from "../data/instances";
import { ContactModel, StatusModel, UserModel } from "../typegoose/models";

export default class StatusModelClass {
  static async getAllStatusContacts({ idUser }: { idUser: string }) {
    try {
      const contacts = await ITSGooseHandler.searchAll({
        Model: ContactModel,
        condition: { idUserOwner: idUser },
      });

      const contactWithStatusAndUser = await Promise.all(
        contacts.map(async (contact: any) => {
            const verifyLast24Hours = (dateString: string) => {
                const date = new Date(dateString); // C
                const dateActual = new Date();
                const diff = Math.abs(dateActual.getTime() - date.getTime());
                const hours = Math.ceil(diff / (1000 * 60 * 60));
              
                return hours <= 24;
              };

          const status = await ITSGooseHandler.searchAll({
            Model: StatusModel,
            condition: { idUser: contact.idUserContact },
            transform: { id: 1, description: 1, image: 1, date: 1, seen: 1 },
          });

          const statusActive = status.map((status: any) => {
            if (verifyLast24Hours(status.date)) return status;
          });

          const user = await ITSGooseHandler.searchOne({
            Model: UserModel,
            condition: { _id: contact.idUserContact },
            transform: { id: 1, userName: 1, image: 1 },
          });

          if (status.length === 0 || !status) return false;

          const sendObj = {
            contact: {
              id: contact.id,
              name: contact.name,
              image: user.image,
              userName: user.userName,
            },
            status: statusActive,
          };

          return sendObj;
        })
      );
      return contactWithStatusAndUser;
    } catch (error) {
      throw error;
    }
  }

  static async createStatus(status: StatusInfo) {
    try {
      const { idUser, description, image } = status;

      const statusCreated = await ITSGooseHandler.addDocument({
        Model: StatusModel,
        data: {
          idUser,
          description,
          image,
          date: new Date(),
        },
      });

      return statusCreated;
    } catch (error) {
      throw error;
    }
  }

  static async deleteStatus({
    idStatus,
    idUser,
  }: {
    idStatus: string;
    idUser: string;
  }) {
    try {
      //Verificar se o status pertence ao usuário
      const status = await ITSGooseHandler.searchOne({
        Model: StatusModel,
        condition: { id: idStatus, idUSer: idUser },
      });

      if (!status) throw new Error("Status not found");

      const statusDeleted = await ITSGooseHandler.removeDocument({
        Model: StatusModel,
        id: idStatus,
      });

      return statusDeleted;
    } catch (error) {
      console.error(error);
      throw new Error("Error to delete status");
    }
  }
}

interface StatusInfo {
  idUser: string;
  description: string;
  image: string;
}
