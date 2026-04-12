import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors";
import {
  parseOptionalInt,
  parseOptionalNumber,
  parseOptionalString,
} from "../utils/parsers";
import * as salesService from "../services/salesService";

type RawItem = {
  productId?: unknown;
  quantity?: unknown;
};

type RawPayment = {
  paymentMethodId?: unknown;
  amount?: unknown;
};

export async function listSales(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const clientIdRaw = Array.isArray(req.query.clientId)
      ? undefined
      : req.query.clientId;
    const clientId = parseOptionalInt(clientIdRaw);
    if (clientId === null) {
      throw new HttpError(400, "Invalid clientId");
    }

    const deliveryMethodRaw = Array.isArray(req.query.deliveryMethodId)
      ? undefined
      : req.query.deliveryMethodId;
    const deliveryMethodId = parseOptionalInt(deliveryMethodRaw);
    if (deliveryMethodId === null) {
      throw new HttpError(400, "Invalid deliveryMethodId");
    }

    const paymentMethodRaw = Array.isArray(req.query.paymentMethodId)
      ? undefined
      : req.query.paymentMethodId;
    const paymentMethodId = parseOptionalInt(paymentMethodRaw);
    if (paymentMethodId === null) {
      throw new HttpError(400, "Invalid paymentMethodId");
    }

    const productRaw = Array.isArray(req.query.productId)
      ? undefined
      : req.query.productId;
    const productId = parseOptionalInt(productRaw);
    if (productId === null) {
      throw new HttpError(400, "Invalid productId");
    }

    const fromRaw = Array.isArray(req.query.from) ? undefined : req.query.from;
    const from = parseOptionalString(fromRaw);
    if (from) {
      if (Number.isNaN(Date.parse(from))) {
        throw new HttpError(400, "Invalid from date");
      }
    }

    const toRaw = Array.isArray(req.query.to) ? undefined : req.query.to;
    const to = parseOptionalString(toRaw);
    if (to) {
      if (Number.isNaN(Date.parse(to))) {
        throw new HttpError(400, "Invalid to date");
      }
    }

    const filters: salesService.SaleFilters = {
      clientId,
      deliveryMethodId,
      paymentMethodId,
      productId,
      from,
      to,
    };

    const sales = await salesService.listSales(filters);
    res.json({ data: sales });
  } catch (error) {
    next(error as Error);
  }
}

export async function getSale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseOptionalInt(req.params.id);
    if (id === undefined || id === null) {
      throw new HttpError(400, "Invalid sale id");
    }
    const sale = await salesService.getSaleById(id);
    if (!sale) {
      throw new HttpError(404, "Sale not found");
    }
    res.json({ data: sale });
  } catch (error) {
    next(error as Error);
  }
}

export async function createSale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deliveryMethodId = parseOptionalInt(req.body.deliveryMethodId);
    if (deliveryMethodId === undefined || deliveryMethodId === null) {
      throw new HttpError(400, "deliveryMethodId is required");
    }

    const dateRaw = parseOptionalString(req.body.date);
    let saleDate = new Date();
    if (dateRaw) {
      const parsedDate = new Date(dateRaw);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new HttpError(400, "Invalid date");
      }
      saleDate = parsedDate;
    }

    const saleNote = parseOptionalString(req.body.saleNote);

    const userId = parseOptionalInt(req.body.userId);
    if (userId === null) {
      throw new HttpError(400, "Invalid userId");
    }

    const clientId = parseOptionalInt(req.body.clientId);
    if (clientId === null) {
      throw new HttpError(400, "Invalid clientId");
    }

    const clientName = parseOptionalString(
      req.body.clientName ?? req.body.client?.name
    );
    const clientNumber = parseOptionalString(
      req.body.clientNumber ?? req.body.client?.number
    );

    if (!clientId && (!clientName || !clientNumber)) {
      throw new HttpError(400, "Client data is required");
    }

    const rawItems = Array.isArray(req.body.items)
      ? (req.body.items as RawItem[])
      : [];
    const itemErrors: string[] = [];
    const itemMap = new Map<number, number>();

    rawItems.forEach((item, index) => {
      const productId = parseOptionalInt(item?.productId);
      const quantity = parseOptionalNumber(item?.quantity);

      if (productId === undefined || productId === null) {
        itemErrors.push(`items[${index}].productId is invalid`);
        return;
      }
      if (quantity === undefined || quantity === null || quantity <= 0) {
        itemErrors.push(`items[${index}].quantity must be greater than 0`);
        return;
      }

      itemMap.set(productId, (itemMap.get(productId) ?? 0) + quantity);
    });

    if (itemErrors.length) {
      throw new HttpError(400, "Invalid items", { errors: itemErrors });
    }

    const items: salesService.SaleItemInput[] = Array.from(
      itemMap.entries()
    ).map(
      ([productId, quantity]) => ({ productId, quantity })
    );

    if (items.length === 0) {
      throw new HttpError(400, "At least one item is required");
    }

    const rawPayments = Array.isArray(req.body.payments)
      ? (req.body.payments as RawPayment[])
      : [];
    const paymentErrors: string[] = [];
    const payments: salesService.PaymentInput[] = [];

    rawPayments.forEach((payment, index) => {
      const paymentMethodId = parseOptionalInt(payment?.paymentMethodId);
      const amount = parseOptionalNumber(payment?.amount);

      if (paymentMethodId === undefined || paymentMethodId === null) {
        paymentErrors.push(`payments[${index}].paymentMethodId is invalid`);
        return;
      }
      if (amount === undefined || amount === null || amount <= 0) {
        paymentErrors.push(`payments[${index}].amount must be greater than 0`);
        return;
      }

      payments.push({ paymentMethodId, amount });
    });

    if (paymentErrors.length) {
      throw new HttpError(400, "Invalid payments", { errors: paymentErrors });
    }

    if (payments.length === 0) {
      throw new HttpError(400, "At least one payment is required");
    }

    const sale = await salesService.createSale({
      deliveryMethodId,
      saleDate,
      saleNote,
      userId: userId ?? null,
      clientId: clientId ?? null,
      clientName,
      clientNumber,
      items,
      payments,
    });

    res.status(201).json({ data: sale });
  } catch (error) {
    next(error as Error);
  }
}
