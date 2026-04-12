import pool from "../db/pool";
import { dashboardQueries } from "../db/queries";

type SummaryRow = {
  total_sales_amount: string | number | null;
  total_products_sold: string | number | null;
  total_stock: string | number | null;
  total_sales_count: string | number | null;
};

export type DashboardSummary = {
  totalSalesAmount: number;
  totalProductsSold: number;
  totalStock: number;
  totalSalesCount: number;
};

type PaymentBalanceRow = {
  id_payment_method: number;
  de_payment_method: string;
  dollar_payment_method: boolean | number | null;
  amount: string | number | null;
};

export type PaymentBalance = {
  id: number;
  name: string;
  isDollar: boolean;
  amount: number;
};

export async function getSummary(): Promise<DashboardSummary> {
  const result = await pool.query<SummaryRow>(dashboardQueries.summary);
  const row = result.rows[0];
  return {
    totalSalesAmount: Number(row.total_sales_amount ?? 0),
    totalProductsSold: Number(row.total_products_sold ?? 0),
    totalStock: Number(row.total_stock ?? 0),
    totalSalesCount: Number(row.total_sales_count ?? 0),
  };
}

export async function getPaymentBalances(): Promise<PaymentBalance[]> {
  const result = await pool.query<PaymentBalanceRow>(
    dashboardQueries.paymentBalances
  );
  return result.rows.map((row) => ({
    id: row.id_payment_method,
    name: row.de_payment_method,
    isDollar: Boolean(row.dollar_payment_method),
    amount: Number(row.amount ?? 0),
  }));
}
