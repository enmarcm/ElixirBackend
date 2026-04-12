import "dotenv/config";
import path from "node:path";

export const PORT = Number(process.env.PORT) || 3000;

export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
