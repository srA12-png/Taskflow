const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/** Normalized API failure with a stable code and optional field errors. */
export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** { fieldName: message } for inline form errors. */
  fieldErrors() {
    const map = {};
    if (Array.isArray(this.details)) {
      for (const detail of this.details) {
        if (detail?.field) map[detail.field] = detail.message;
      }
    }
    return map;
  }
}

async function request(path, { method = "GET", body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      // The JWT lives in an HttpOnly cookie, so it is sent automatically.
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Cannot reach the server. Check your connection and try again.",
    );
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "REQUEST_FAILED",
      error?.message ?? "Something went wrong. Please try again.",
      error?.details ?? [],
    );
  }

  return payload?.data ?? null;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
