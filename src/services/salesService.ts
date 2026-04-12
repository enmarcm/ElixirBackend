import type { QueryResult } from "pg";
import pool from "../db/pool";
import { salesQueries } from "../db/queries";
import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/errors";

type SaleRow = {
  id_sale: number;
  da_sale: string;
  id_place: number | null;
  kn_sale: string | null;
  id_client: number | null;
  id_user: number | null;
  na_client: string | null;
  nu_client: string | null;
  de_place: string | null;
  total_amount: string | number | null;
  payments: unknown;
  items: unknown;
};

export type SalePayment = {
  paymentMethodId: number;
  paymentMethod: string;
  amount: number;
  isDollar: boolean;
};

export type SaleItem = {
  productId: number;
  product: string;
  quantity: number;
  price: number;
  image: string | null;
};

export type Sale = {
  id: number;
  date: string;
  deliveryMethod: { id: number; name: string } | null;
  saleNote: string | null;
  client: { id: number; name: string; number: string } | null;
  userId: number | null;
  totalAmount: number;
  payments: SalePayment[];
  items: SaleItem[];
};

export type SaleFilters = {
  clientId?: number;
  deliveryMethodId?: number;
  paymentMethodId?: number;
  productId?: number;
  from?: string;
  to?: string;
};

export type SaleItemInput = {
  productId: number;
  quantity: number;
};

export type PaymentInput = {
  paymentMethodId: number;
  amount: number;
};

export type CreateSaleInput = {
  deliveryMethodId: number;
  saleDate: Date;
  saleNote?: string;
  userId?: number | null;
  clientId?: number | null;
  clientName?: string;
  clientNumber?: string;
  items: SaleItemInput[];
  payments: PaymentInput[];
};

type QueryParams = Array<
  string | number | boolean | null | string[] | number[]
>;

type Queryable = {
  query: <T>(text: string, params?: QueryParams) => Promise<QueryResult<T>>;
};

function mapSale(row: SaleRow): Sale {
  const payments = Array.isArray(row.payments) ? row.payments : [];
  const items = Array.isArray(row.items) ? row.items : [];
  return {
    id: row.id_sale,
    date: row.da_sale,
    deliveryMethod: row.id_place
      ? { id: row.id_place, name: row.de_place ?? "" }
      : null,
    saleNote: row.kn_sale,
    client: row.id_client
      ? {
          id: row.id_client,
          name: row.na_client ?? "",
          number: row.nu_client ?? "",
        }
      : null,
    userId: row.id_user,
    totalAmount: Number(row.total_amount ?? 0),
    payments: payments as SalePayment[],
    items: items as SaleItem[],
  };
}

function buildSalesFilters(filters: SaleFilters) {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  const addCondition = (template: string, value: string | number) => {
    params.push(value);
    conditions.push(template.replace("$", `$${params.length}`));
  };

  if (filters.clientId !== undefined) {
    addCondition(salesQueries.filters.clientId, filters.clientId);
  }
  if (filters.deliveryMethodId !== undefined) {
    addCondition(salesQueries.filters.deliveryMethodId, filters.deliveryMethodId);
  }
  if (filters.paymentMethodId !== undefined) {
    addCondition(
      salesQueries.filters.paymentMethodId,
      filters.paymentMethodId
    );
  }
  if (filters.productId !== undefined) {
    addCondition(salesQueries.filters.productId, filters.productId);
  }
  if (filters.from) {
    addCondition(salesQueries.filters.fromDate, filters.from);
  }
  if (filters.to) {
    addCondition(salesQueries.filters.toDate, filters.to);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  return { whereClause, params };
}

async function fetchSales(
  db: Queryable,
  whereClause: string,
  params: Array<string | number>
): Promise<Sale[]> {
  const result = await db.query<SaleRow>(
    salesQueries.buildSalesList(whereClause),
    params
  );
  return result.rows.map(mapSale);
}

export async function listSales(filters: SaleFilters): Promise<Sale[]> {
  const { whereClause, params } = buildSalesFilters(filters);
  return fetchSales(pool, whereClause, params);
}

export async function getSaleById(id: number): Promise<Sale | null> {
  const sales = await fetchSales(pool, "WHERE s.id_sale = $1", [id]);
  return sales[0] ?? null;
}

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  if (!input.items.length) {
    throw new HttpError(400, "At least one item is required");
  }
  if (!input.payments.length) {
    throw new HttpError(400, "At least one payment is required");
  }
  if (
    !input.clientId &&
    (!input.clientName || !input.clientNumber)
  ) {
    throw new HttpError(400, "Client data is required");
  }

  return withTransaction(async (client) => {
    let resolvedClientId = input.clientId ?? null;
    if (!resolvedClientId) {
      const existing = await client.query<{ id_client: number }>(
        salesQueries.selectClientByNumber,
        [input.clientNumber]
      );

      if (existing.rowCount && existing.rows[0]) {
        resolvedClientId = existing.rows[0].id_client;
      } else {
        const inserted = await client.query<{ id_client: number }>(
          salesQueries.insertClient,
          [input.clientName, input.clientNumber]
        );
        resolvedClientId = inserted.rows[0].id_client;
      }
    } else {
      const clientCheck = await client.query(
        salesQueries.checkClientExists,
        [resolvedClientId]
      );
      if (clientCheck.rowCount === 0) {
        throw new HttpError(404, "Client not found");
      }
    }

    const deliveryCheck = await client.query(
      salesQueries.checkDeliveryExists,
      [input.deliveryMethodId]
    );
    if (deliveryCheck.rowCount === 0) {
      throw new HttpError(404, "Delivery method not found");
    }

    const paymentMethodIds = Array.from(
      new Set(input.payments.map((payment) => payment.paymentMethodId))
    );
    const paymentCheck = await client.query<{ id_payment_method: number }>(
      salesQueries.checkPaymentMethods,
      [paymentMethodIds]
    );
    if (paymentCheck.rowCount !== paymentMethodIds.length) {
      throw new HttpError(404, "One or more payment methods were not found");
    }

    const saleResult = await client.query<{ id_sale: number }>(
      salesQueries.insertSale,
      [
        resolvedClientId,
        input.userId ?? null,
        input.saleDate.toISOString(),
        input.deliveryMethodId,
        input.saleNote ?? null,
      ]
    );

    const saleId = saleResult.rows[0].id_sale;

    const productIds = Array.from(
      new Set(input.items.map((item) => item.productId))
    );
    const stockResult = await client.query<{
      id_product: number;
      st_product: string | number;
    }>(salesQueries.selectProductStock, [productIds]);

    if (stockResult.rowCount !== productIds.length) {
      throw new HttpError(404, "One or more products were not found");
    }

    const stockMap = new Map<number, number>();
    stockResult.rows.forEach((row) => {
      stockMap.set(row.id_product, Number(row.st_product));
    });

    for (const item of input.items) {
      const available = stockMap.get(item.productId) ?? 0;
      if (available < item.quantity) {
        throw new HttpError(409, "Insufficient stock", {
          productId: item.productId,
          available,
          requested: item.quantity,
        });
      }

      const updateResult = await client.query<{ id_product: number }>(
        salesQueries.updateProductStock,
        [item.quantity, item.productId]
      );

      if (updateResult.rowCount === 0) {
        throw new HttpError(409, "Insufficient stock", {
          productId: item.productId,
        });
      }

      await client.query(salesQueries.insertProductSale, [
        saleId,
        item.productId,
        item.quantity,
      ]);
    }

    for (const payment of input.payments) {
      await client.query(salesQueries.insertPayment, [
        saleId,
        payment.paymentMethodId,
        payment.amount,
      ]);
    }

    const [sale] = await fetchSales(client, "WHERE s.id_sale = $1", [saleId]);
    if (!sale) {
      throw new HttpError(500, "Sale could not be loaded");
    }
    return sale;
  });
}
