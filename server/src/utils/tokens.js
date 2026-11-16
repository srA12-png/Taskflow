import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

const COOKIE_OPTIONS = {
  httpOnly: true, // JavaScript cannot read the token -> XSS cannot steal it
  sameSite: "lax", // blocks cross-site POSTs while keeping same-site navigation
  secure: config.cookieSecure, // must be true behind HTTPS in production
  path: "/",
};

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: "taskflow",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, { issuer: "taskflow" });
}

export function setAuthCookie(response, token) {
  response.cookie(config.cookieName, token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(response) {
  response.clearCookie(config.cookieName, COOKIE_OPTIONS);
}
