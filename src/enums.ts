import { BASE_URL } from "./constants";

export enum Routes {
  MAIN = "/",
  AUTH = "/auth",
  PROFILE = "/profile",
  MESSAGES = "/messages",
  CONTACTS = "/contacts"
}

export const URLS = {
  MAIN: BASE_URL,
  ACTIVATE_USER: `${BASE_URL}/auth/activateUser`,


};

export enum Constants {
  ERROR = "error",
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}
