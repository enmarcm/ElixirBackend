import { Request, Response } from "express";

const midNotFound = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
};

export default midNotFound;
