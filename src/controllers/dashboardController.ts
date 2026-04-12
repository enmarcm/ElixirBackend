import { NextFunction, Request, Response } from "express";
import * as dashboardService from "../services/dashboardService";

export async function getSummary(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const summary = await dashboardService.getSummary();
    res.json({ data: summary });
  } catch (error) {
    next(error as Error);
  }
}

export async function getPaymentBalances(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const balances = await dashboardService.getPaymentBalances();
    res.json({ data: balances });
  } catch (error) {
    next(error as Error);
  }
}
