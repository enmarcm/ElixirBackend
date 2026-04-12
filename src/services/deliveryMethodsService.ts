import pool from "../db/pool";
import { deliveryMethodQueries } from "../db/queries";

type DeliveryRow = {
  id_place: number;
  de_place: string;
};

export type DeliveryMethod = {
  id: number;
  name: string;
};

function mapDelivery(row: DeliveryRow): DeliveryMethod {
  return {
    id: row.id_place,
    name: row.de_place,
  };
}

export async function listDeliveryMethods(): Promise<DeliveryMethod[]> {
  const result = await pool.query<DeliveryRow>(deliveryMethodQueries.list);
  return result.rows.map(mapDelivery);
}

export async function createDeliveryMethod(data: {
  name: string;
}): Promise<DeliveryMethod> {
  const result = await pool.query<DeliveryRow>(deliveryMethodQueries.create, [
    data.name,
  ]);
  return mapDelivery(result.rows[0]);
}

export async function updateDeliveryMethod(
  id: number,
  data: { name: string }
): Promise<DeliveryMethod | null> {
  const result = await pool.query<DeliveryRow>(deliveryMethodQueries.update, [
    data.name,
    id,
  ]);
  if (result.rowCount === 0) {
    return null;
  }
  return mapDelivery(result.rows[0]);
}

export async function deleteDeliveryMethod(id: number): Promise<boolean> {
  const result = await pool.query(deliveryMethodQueries.remove, [id]);
  return result.rowCount > 0;
}
