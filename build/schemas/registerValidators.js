"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const REGISTER_VALIDATORS = {
    userName: (v) => typeof v === "string" && /^[a-zA-Z0-9]{6,10}$/.test(v),
    email: (v) => typeof v === "string" && /\S+@\S+\.\S+/.test(v),
    password: (v) => typeof v === "string" && /^[A-Za-z\d/.@$!%*#?&]{6,20}$/.test(v),
    dateOfBirth: (v) => {
        if (typeof v === "string") {
            v = new Date(v);
        }
        return v instanceof Date && !isNaN(v.getTime());
    },
};
exports.default = REGISTER_VALIDATORS;
