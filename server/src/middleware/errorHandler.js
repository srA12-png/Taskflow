import { AppError } from "../utils/AppError.js";
import { config } from "../config/env.js";

export function notFoundHandler(request, response) {
  response.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
}

/**
 * Central error handler.
 * - Known AppErrors keep their status/code/message.
 * - SQLite constraint violations become 409 without leaking SQL.
 * - Everything else is logged server-side and returned as a generic 500.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, request, response, next) {
  if (error instanceof AppError) {
    return response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  if (typeof error.code === "string" && error.code.startsWith("SQLITE_CONSTRAINT")) {
    return response.status(409).json({
      error: {
        code: "CONSTRAINT_VIOLATION",
        message: "That value conflicts with an existing record",
      },
    });
  }

  if (error.type === "entity.parse.failed") {
    return response.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body must be valid JSON" },
    });
  }

  console.error("[api] unhandled error:", error);
  return response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
      ...(config.isProduction ? {} : {}),
    },
  });
}
