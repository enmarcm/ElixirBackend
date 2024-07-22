import { Router } from "express";
import StatusModelClass from "../models/StatusModel";

const statusRouter = Router();

statusRouter.get("/getAllStatusContacts", async (req, res) => {
  try {
    const { idUser } = req as any;

    const result = await StatusModelClass.getAllStatusContacts({ idUser });

    if (!result[0]) return res.json({ data: [] });

    return res.json({ data: result });
  } catch (error: any) {
    throw new Error(error);
  }
});

statusRouter.post("/createStatus", async (req, res) => {
  try {
    const { description, image } = req.body;

    const { idUser } = req as any;

    const status = {
      idUser,
      description,
      image,
    };

    const result = await StatusModelClass.createStatus(status);

    return res.json(result);
  } catch (error) {
    throw new Error("Error to create status");
  }
});

statusRouter.delete("/deleteStatus/:idStatus", (req, res) => {
  try {
    const { idUser } = req as any;
    const { idStatus } = req.params;

    const result = StatusModelClass.deleteStatus({ idStatus, idUser });

    return res.json(result);
  } catch (error) {
    throw new Error("Error to delete status");
  }
});
export default statusRouter;
