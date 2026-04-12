import { NextFunction, Request, Response } from "express";
import { isHttpError } from "../utils/errors";

export default function midErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = isHttpError(err) ? err.status : 500;
  const message = isHttpError(err)
    ? err.message
    : "Unexpected server error";
  const details = isHttpError(err) ? err.details : undefined;

  res.status(status).json({
    error: message,
    ...(details ? { details } : {}),
  });
}
