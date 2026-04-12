import pool from "../db/pool";
import { productQueries } from "../db/queries";

type ProductRow = {
  id_product: number;
  de_product: string;
  im_product: string | null;
  pr_product: string | number;
  st_product: string | number;
};

export type Product = {
  id: number;
  name: string;
  image: string | null;
  price: number;
  stock: number;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id_product,
    name: row.de_product,
    image: row.im_product,
    price: Number(row.pr_product),
    stock: Number(row.st_product),
  };
}

export async function listProducts(): Promise<Product[]> {
  const result = await pool.query<ProductRow>(productQueries.list);
  return result.rows.map(mapProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const result = await pool.query<ProductRow>(productQueries.getById, [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return mapProduct(result.rows[0]);
}

export async function createProduct(data: {
  name: string;
  image?: string | null;
  price: number;
  stock: number;
}): Promise<Product> {
  const result = await pool.query<ProductRow>(productQueries.create, [
    data.name,
    data.image ?? null,
    data.price,
    data.stock,
  ]);
  return mapProduct(result.rows[0]);
}

export async function updateProduct(
  id: number,
  data: {
    name?: string | null;
    image?: string | null;
    price?: number | null;
    stock?: number | null;
  }
): Promise<Product | null> {
  const result = await pool.query<ProductRow>(productQueries.update, [
    data.name ?? null,
    data.image ?? null,
    data.price ?? null,
    data.stock ?? null,
    id,
  ]);
  if (result.rowCount === 0) {
    return null;
  }
  return mapProduct(result.rows[0]);
}

export async function deleteProduct(id: number): Promise<boolean> {
  const result = await pool.query(productQueries.remove, [id]);
  return result.rowCount > 0;
}
