import "dotenv/config";
import { Response } from "express";
import { ErrorHandler, HostConfig } from "./types";

export const PORT = Number(process.env.PORT) || 3000;

export const Hosts: Record<string, HostConfig> = {
  gmail: {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
  },
  outlook: {
    host: "smtp.office365.com",
    port: 587,
    secure: false,
  },
};

export const ERROR_HANDLERS: Record<string, ErrorHandler> = {
  CastError: (res: Response) =>
    res.status(400).json({ error: "Malformatted ID" }),
  ValidationError: (res: Response) =>
    res.status(409).json({ error: "Validation error" }),
  JsonWebTokenError: (res: Response, message?: string) =>
    res.status(401).json({ error: "Invalid token", message }),
  TokenExpiredError: (res: Response, message?: string) =>
    res.status(401).json({ error: "Expired token", message }),
  defaultError: (res: Response) =>
    res.status(500).json({ error: "Something went wrong" }),
};

// export const BASE_URL:string = process.env.BASE_URL || `http://localhost:${PORT}`;
export const BASE_URL: string =
  process.env.BASE_URL || `http://192.168.109.126:${PORT}`;

export const CONFIG_SERVER_SOCKET = {
  cors: {
    origin: "*",
  },
};
