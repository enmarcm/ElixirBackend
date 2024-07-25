import { Request, Response } from "express";
import { Router } from "express";
import GroupModelClass from "../models/GroupsModelClass";

const groupRouter = Router();

groupRouter.get("/getAllGroupsUser", async (req: Request, res: Response) => {
  try {
    const { idUser } = req as any;

    const result = await GroupModelClass.getAllGroupsUser(idUser);

    return res.json(result);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
});

groupRouter.get("/obtainGroupMessages/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = GroupModelClass.getGroupById(id);

    return res.json(result);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
});

groupRouter.get("/getGroupById/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = GroupModelClass.getGroupById(id);

    return res.json(result);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
});

groupRouter.post("/createGroup", (req: Request, res: Response) => {
  try {
    const { idUser } = req as any;
    const { name, description, image, users } = req.body;

    const result = GroupModelClass.createGroup({
      name,
      description,
      image,
      idUserOwner: idUser,
      idUsers: users,
    });

    return res.json(result);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
});

groupRouter.delete("/deleteGroup/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = GroupModelClass.deleteGroup(id);

    return res.json(result);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
});

export default groupRouter;
