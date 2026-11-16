import { getDb, withTransaction } from "../db/connection.js";
import { AppError } from "../utils/AppError.js";

export const DEFAULT_CATEGORIES = [
  { name: "Personal", color: "#6366F1" },
  { name: "Work", color: "#0EA5E9" },
  { name: "Study", color: "#8B5CF6" },
  { name: "Health", color: "#10B981" },
  { name: "Other", color: "#64748B" },
];

export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findUserById(id) {
  const db = await getDb();
  const row = await db.get(
    `SELECT id, name, email, created_at, updated_at
       FROM users WHERE id = ?`,
    [id],
  );
  return toPublicUser(row);
}

export async function findUserWithHashByEmail(email) {
  const db = await getDb();
  return db.get(
    `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users WHERE email = ?`,
    [email],
  );
}

export async function findUserIdByEmail(email) {
  const db = await getDb();
  const row = await db.get("SELECT id FROM users WHERE email = ?", [email]);
  return row?.id ?? null;
}

/**
 * Creates the user and their default categories atomically, so an account can
 * never exist without the expected starting categories.
 */
export async function createUser({ name, email, passwordHash }) {
  const now = new Date().toISOString();

  return withTransaction(async (db) => {
    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, passwordHash, now, now],
    );
    const userId = result.lastID;

    for (const category of DEFAULT_CATEGORIES) {
      await db.run(
        `INSERT INTO categories (user_id, name, color, created_at)
         VALUES (?, ?, ?, ?)`,
        [userId, category.name, category.color, now],
      );
    }

    const row = await db.get(
      `SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?`,
      [userId],
    );
    return toPublicUser(row);
  });
}

export async function updateUserName(userId, name) {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.run(
    "UPDATE users SET name = ?, updated_at = ? WHERE id = ?",
    [name, now, userId],
  );
  if (result.changes === 0) {
    throw AppError.notFound("USER_NOT_FOUND", "Account not found");
  }
  return findUserById(userId);
}

export async function updateUserPassword(userId, passwordHash) {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.run(
    "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
    [passwordHash, now, userId],
  );
  if (result.changes === 0) {
    throw AppError.notFound("USER_NOT_FOUND", "Account not found");
  }
}

export async function findPasswordHash(userId) {
  const db = await getDb();
  const row = await db.get("SELECT password_hash FROM users WHERE id = ?", [
    userId,
  ]);
  return row?.password_hash ?? null;
}
