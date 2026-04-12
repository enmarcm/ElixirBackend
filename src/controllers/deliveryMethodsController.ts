import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors";
import { parseOptionalInt, parseOptionalString } from "../utils/parsers";
import * as deliveryMethodsService from "../services/deliveryMethodsService";

export async function listDeliveryMethods(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const methods = await deliveryMethodsService.listDeliveryMethods();
    res.json({ data: methods });
  } catch (error) {
    next(error as Error);
  }
}

export async function createDeliveryMethod(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const name = parseOptionalString(req.body.name);
    if (!name) {
      throw new HttpError(400, "Delivery method name is required");
    }
    const method = await deliveryMethodsService.createDeliveryMethod({ name });
    res.status(201).json({ data: method });
  } catch (error) {
    next(error as Error);
  }
}

export async function updateDeliveryMethod(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid delivery method id");
    }

    const name = parseOptionalString(req.body.name);
    if (!name) {
      throw new HttpError(400, "Delivery method name is required");
    }

    const method = await deliveryMethodsService.updateDeliveryMethod(id, {
      name,
    });
    if (!method) {
      throw new HttpError(404, "Delivery method not found");
    }

    res.json({ data: method });
  } catch (error) {
    next(error as Error);
  }
}

export async function deleteDeliveryMethod(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid delivery method id");
    }
    const removed = await deliveryMethodsService.deleteDeliveryMethod(id);
    if (!removed) {
      throw new HttpError(404, "Delivery method not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error as Error);
  }
}
