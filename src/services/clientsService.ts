import pool from "../db/pool";
import { clientQueries } from "../db/queries";

type ClientRow = {
  id_client: number;
  na_client: string;
  nu_client: string;
};

export type Client = {
  id: number;
  name: string;
  number: string;
};

function mapClient(row: ClientRow): Client {
  return {
    id: row.id_client,
    name: row.na_client,
    number: row.nu_client,
  };
}

export async function listClients(search?: string): Promise<Client[]> {
  const query = search ? clientQueries.search : clientQueries.list;
  const params = search ? [`%${search}%`] : [];
  const result = await pool.query<ClientRow>(query, params);
  return result.rows.map(mapClient);
}

export async function getClientById(id: number): Promise<Client | null> {
  const result = await pool.query<ClientRow>(clientQueries.getById, [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return mapClient(result.rows[0]);
}

export async function createClient(data: {
  name: string;
  number: string;
}): Promise<Client> {
  const result = await pool.query<ClientRow>(clientQueries.create, [
    data.name,
    data.number,
  ]);
  return mapClient(result.rows[0]);
}

export async function updateClient(
  id: number,
  data: { name?: string | null; number?: string | null }
): Promise<Client | null> {
  const result = await pool.query<ClientRow>(clientQueries.update, [
    data.name ?? null,
    data.number ?? null,
    id,
  ]);
  if (result.rowCount === 0) {
    return null;
  }
  return mapClient(result.rows[0]);
}

export async function deleteClient(id: number): Promise<boolean> {
  const result = await pool.query(clientQueries.remove, [id]);
  return result.rowCount > 0;
}
