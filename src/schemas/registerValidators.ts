import { ValidatorFunction } from "../types";

const REGISTER_VALIDATORS: { [key: string]: ValidatorFunction } = {
  userName: (v: string | Date) =>
    typeof v === "string" && /^[a-zA-Z0-9]{6,10}$/.test(v),
  email: (v: string | Date) => typeof v === "string" && /\S+@\S+\.\S+/.test(v),
  password: (v: string | Date) =>
    typeof v === "string" && /^[A-Za-z\d/.@$!%*#?&]{6,20}$/.test(v),
  dateOfBirth: (v: string | Date) => {
    if (typeof v === "string") {
      v = new Date(v);
    }
    return v instanceof Date && !isNaN(v.getTime());
  },
};

export default REGISTER_VALIDATORS;