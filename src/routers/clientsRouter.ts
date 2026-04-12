import { Router } from "express";
import {
  createClient,
  deleteClient,
  getClient,
  listClients,
  updateClient,
} from "../controllers/clientsController";

const clientsRouter = Router();

clientsRouter.get("/", listClients);
clientsRouter.get("/:id", getClient);
clientsRouter.post("/", createClient);
clientsRouter.patch("/:id", updateClient);
clientsRouter.delete("/:id", deleteClient);

export default clientsRouter;

//Agrege comentario