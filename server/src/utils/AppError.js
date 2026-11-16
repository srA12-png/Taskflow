/** Error with an HTTP status and a stable machine-readable code. */
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(code, message, details) {
    return new AppError(400, code, message, details);
  }

  static unauthorized(message = "You need to sign in to continue") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have access to this resource") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(code, message) {
    return new AppError(404, code, message);
  }

  static conflict(code, message) {
    return new AppError(409, code, message);
  }
}
