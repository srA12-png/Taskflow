import { rateLimit } from "express-rate-limit";
import { config } from "../config/env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defence for cookie-based auth.
 *
 * Browsers always send `Origin` on cross-site state-changing requests, so a
 * mismatched origin is rejected. Requests without an Origin header come from
 * non-browser clients (curl, server-to-server) and cannot carry a victim's
 * cookie automatically, so they are allowed through.
 *
 * SameSite=Lax on the auth cookie is the second layer of this defence.
 */
export function originCheck(request, response, next) {
  if (SAFE_METHODS.has(request.method)) return next();

  const origin = request.get("origin");
  if (!origin) return next();

  if (!config.clientOrigins.includes(origin)) {
    return response.status(403).json({
      error: {
        code: "ORIGIN_NOT_ALLOWED",
        message: "Request origin is not allowed",
      },
    });
  }

  return next();
}

const limiterDefaults = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => config.isTest,
};

/** Tight limit on credential endpoints to slow down brute force attempts. */
export const authLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many attempts. Please try again in a few minutes.",
    },
  },
});

/** Broad safety net for the rest of the API. */
export const apiLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please slow down.",
    },
  },
});
