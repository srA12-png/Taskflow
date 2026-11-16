import { config } from "../config/env.js";
import { verifyToken } from "../utils/tokens.js";
import { findUserById } from "../services/userService.js";
import { AppError } from "../utils/AppError.js";

/**
 * Reads the JWT from the HttpOnly cookie and loads the current user.
 * Never trusts a user id from the request body or query string.
 */
export async function requireAuth(request, _response, next) {
  try {
    const token = request.cookies?.[config.cookieName];
    if (!token) {
      throw AppError.unauthorized();
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw AppError.unauthorized("Your session has expired. Please sign in again.");
    }

    const user = await findUserById(Number(payload.sub));
    if (!user) {
      throw AppError.unauthorized("Your session is no longer valid");
    }

    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
