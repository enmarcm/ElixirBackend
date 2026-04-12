import { Express } from "express";

export interface StartServerProps {
  app: Express;
  PORT: number;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}
