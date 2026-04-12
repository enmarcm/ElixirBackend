import { Request, Response } from "express";

export function root(_req: Request, res: Response) {
  res.json({ status: "ok", service: "magno-store-api" });
}
