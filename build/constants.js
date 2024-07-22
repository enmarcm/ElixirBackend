"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG_SERVER_SOCKET = exports.BASE_URL = exports.ERROR_HANDLERS = exports.Hosts = exports.PORT = void 0;
require("dotenv/config");
exports.PORT = Number(process.env.PORT) || 3000;
exports.Hosts = {
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
exports.ERROR_HANDLERS = {
    CastError: (res) => res.status(400).json({ error: "Malformatted ID" }),
    ValidationError: (res) => res.status(409).json({ error: "Validation error" }),
    JsonWebTokenError: (res, message) => res.status(401).json({ error: "Invalid token", message }),
    TokenExpiredError: (res, message) => res.status(401).json({ error: "Expired token", message }),
    defaultError: (res) => res.status(500).json({ error: "Something went wrong" }),
};
// export const BASE_URL:string = process.env.BASE_URL || `http://localhost:${PORT}`;
exports.BASE_URL = process.env.BASE_URL || `http://192.168.109.126:${exports.PORT}`;
exports.CONFIG_SERVER_SOCKET = {
    cors: {
        origin: "*",
    },
};
