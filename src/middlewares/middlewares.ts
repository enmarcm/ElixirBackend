import cors from "cors";
import express from "express";
import midErrorHandler from "./midErrorHandler";
import midNotFound from "./midNotFound";

export const midJson = () => express.json({ limit: "10mb" });

export const midCors = () => cors({ credentials: true, origin: "*" });

export { midErrorHandler, midNotFound };
