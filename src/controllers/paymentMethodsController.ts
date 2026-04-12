import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors";
import {
  parseOptionalBoolean,
  parseOptionalInt,
  parseOptionalString,
} from "../utils/parsers";
import * as paymentMethodsService from "../services/paymentMethodsService";

export async function listPaymentMethods(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const methods = await paymentMethodsService.listPaymentMethods();
    res.json({ data: methods });
  } catch (error) {
    next(error as Error);
  }
}

export async function createPaymentMethod(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const name = parseOptionalString(req.body.name);
    const isDollar = parseOptionalBoolean(req.body.isDollar);

    if (!name) {
      throw new HttpError(400, "Payment method name is required");
    }
    if (isDollar === null) {
      throw new HttpError(400, "isDollar must be a boolean");
    }
    const method = await paymentMethodsService.createPaymentMethod({
      name,
      isDollar: isDollar ?? false,
    });
    res.status(201).json({ data: method });
  } catch (error) {
    next(error as Error);
  }
}

export async function updatePaymentMethod(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid payment method id");
    }

    const name = parseOptionalString(req.body.name);
    const isDollar = parseOptionalBoolean(req.body.isDollar);

    if (isDollar === null) {
      throw new HttpError(400, "isDollar must be a boolean");
    }
    if (name === undefined && isDollar === undefined) {
      throw new HttpError(400, "No changes provided");
    }
    const method = await paymentMethodsService.updatePaymentMethod(id, {
      name: name ?? null,
      isDollar: isDollar ?? null,
    });
    if (!method) {
      throw new HttpError(404, "Payment method not found");
    }

    res.json({ data: method });
  } catch (error) {
    next(error as Error);
  }
}

export async function deletePaymentMethod(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid payment method id");
    }
    const removed = await paymentMethodsService.deletePaymentMethod(id);
    if (!removed) {
      throw new HttpError(404, "Payment method not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error as Error);
  }
}
