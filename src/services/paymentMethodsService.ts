import pool from "../db/pool";
import { paymentMethodQueries } from "../db/queries";

type PaymentMethodRow = {
  id_payment_method: number;
  de_payment_method: string;
  dollar_payment_method: boolean | number | null;
};

export type PaymentMethod = {
  id: number;
  name: string;
  isDollar: boolean;
};

function mapPaymentMethod(row: PaymentMethodRow): PaymentMethod {
  return {
    id: row.id_payment_method,
    name: row.de_payment_method,
    isDollar: Boolean(row.dollar_payment_method),
  };
}

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const result = await pool.query<PaymentMethodRow>(paymentMethodQueries.list);
  return result.rows.map(mapPaymentMethod);
}

export async function createPaymentMethod(data: {
  name: string;
  isDollar: boolean;
}): Promise<PaymentMethod> {
  const result = await pool.query<PaymentMethodRow>(
    paymentMethodQueries.create,
    [data.name, data.isDollar]
  );
  return mapPaymentMethod(result.rows[0]);
}

export async function updatePaymentMethod(
  id: number,
  data: { name?: string | null; isDollar?: boolean | null }
): Promise<PaymentMethod | null> {
  const result = await pool.query<PaymentMethodRow>(
    paymentMethodQueries.update,
    [data.name ?? null, data.isDollar ?? null, id]
  );
  if (result.rowCount === 0) {
    return null;
  }
  return mapPaymentMethod(result.rows[0]);
}

export async function deletePaymentMethod(id: number): Promise<boolean> {
  const result = await pool.query(paymentMethodQueries.remove, [id]);
  return result.rowCount > 0;
}
