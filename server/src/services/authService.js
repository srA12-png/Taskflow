import bcrypt from "bcryptjs";
import {
  createUser,
  findPasswordHash,
  findUserWithHashByEmail,
  findUserIdByEmail,
  toPublicUser,
  updateUserPassword,
} from "./userService.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/tokens.js";

const SALT_ROUNDS = 12;

// Compared against when an email is unknown so response timing does not reveal
// whether an account exists.
const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEe.z6v0z9fJ8o3XbR0EoHnOa1yF8LQK9jW";

export async function registerUser({ name, email, password }) {
  const existingId = await findUserIdByEmail(email);
  if (existingId) {
    throw AppError.conflict(
      "EMAIL_TAKEN",
      "An account with this email already exists",
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ name, email, passwordHash });

  return { user, token: signToken(user.id) };
}

export async function loginUser({ email, password }) {
  const row = await findUserWithHashByEmail(email);

  if (!row) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const matches = await bcrypt.compare(password, row.password_hash);
  if (!matches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return { user: toPublicUser(row), token: signToken(row.id) };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const currentHash = await findPasswordHash(userId);
  if (!currentHash) {
    throw AppError.notFound("USER_NOT_FOUND", "Account not found");
  }

  const matches = await bcrypt.compare(currentPassword, currentHash);
  if (!matches) {
    throw new AppError(
      400,
      "INVALID_CURRENT_PASSWORD",
      "Current password is incorrect",
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUserPassword(userId, passwordHash);
}
