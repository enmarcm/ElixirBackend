import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors";
import { parseOptionalInt, parseOptionalString } from "../utils/parsers";
import * as clientsService from "../services/clientsService";

export async function listClients(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const search = parseOptionalString(req.query.search);
    const clients = await clientsService.listClients(search);
    res.json({ data: clients });
  } catch (error) {
    next(error as Error);
  }
}

export async function getClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid client id");
    }
    const client = await clientsService.getClientById(id);
    if (!client) {
      throw new HttpError(404, "Client not found");
    }
    res.json({ data: client });
  } catch (error) {
    next(error as Error);
  }
}

export async function createClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const name = parseOptionalString(req.body.name);
    const number = parseOptionalString(req.body.number);

    if (!name || !number) {
      throw new HttpError(400, "Client name and number are required");
    }
    const client = await clientsService.createClient({ name, number });
    res.status(201).json({ data: client });
  } catch (error) {
    next(error as Error);
  }
}

export async function updateClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid client id");
    }

    const name = parseOptionalString(req.body.name);
    const number = parseOptionalString(req.body.number);

    if (name === undefined && number === undefined) {
      throw new HttpError(400, "No changes provided");
    }

    const client = await clientsService.updateClient(id, {
      name: name ?? null,
      number: number ?? null,
    });
    if (!client) {
      throw new HttpError(404, "Client not found");
    }

    res.json({ data: client });
  } catch (error) {
    next(error as Error);
  }
}

export async function deleteClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid client id");
    }
    const removed = await clientsService.deleteClient(id);
    if (!removed) {
      throw new HttpError(404, "Client not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error as Error);
  }
}
