import { getDb } from "../db/connection.js";
import { AppError } from "../utils/AppError.js";

function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    taskCount: row.task_count ?? 0,
    createdAt: row.created_at,
  };
}

export async function listCategories(userId) {
  const db = await getDb();
  const rows = await db.all(
    `SELECT c.*, COUNT(t.id) AS task_count
       FROM categories c
       LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = c.user_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.name COLLATE NOCASE ASC`,
    [userId],
  );
  return rows.map(toCategory);
}

export async function findCategory(userId, id) {
  const db = await getDb();
  const row = await db.get(
    "SELECT * FROM categories WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  if (!row) {
    throw AppError.notFound("CATEGORY_NOT_FOUND", "Category not found");
  }
  const countRow = await db.get(
    "SELECT COUNT(*) AS count FROM tasks WHERE category_id = ? AND user_id = ?",
    [id, userId],
  );
  return toCategory({ ...row, task_count: countRow?.count ?? 0 });
}

export async function createCategory(userId, { name, color }) {
  const db = await getDb();
  const duplicate = await db.get(
    "SELECT id FROM categories WHERE user_id = ? AND name = ? COLLATE NOCASE",
    [userId, name],
  );
  if (duplicate) {
    throw AppError.conflict(
      "CATEGORY_EXISTS",
      "You already have a category with that name",
    );
  }

  const result = await db.run(
    `INSERT INTO categories (user_id, name, color, created_at)
     VALUES (?, ?, ?, ?)`,
    [userId, name, color, new Date().toISOString()],
  );

  return findCategory(userId, result.lastID);
}

export async function updateCategory(userId, id, fields) {
  const db = await getDb();
  const existing = await db.get(
    "SELECT * FROM categories WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  if (!existing) {
    throw AppError.notFound("CATEGORY_NOT_FOUND", "Category not found");
  }

  const name = fields.name ?? existing.name;
  const duplicate = await db.get(
    "SELECT id FROM categories WHERE user_id = ? AND name = ? COLLATE NOCASE AND id <> ?",
    [userId, name, id],
  );
  if (duplicate) {
    throw AppError.conflict(
      "CATEGORY_EXISTS",
      "You already have a category with that name",
    );
  }

  await db.run(
    "UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?",
    [name, fields.color ?? existing.color, id, userId],
  );

  return findCategory(userId, id);
}

/**
 * Deleting a category keeps its tasks: the foreign key is
 * ON DELETE SET NULL, so affected tasks simply become "Uncategorized".
 */
export async function deleteCategory(userId, id) {
  const db = await getDb();
  const existing = await db.get(
    "SELECT id FROM categories WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  if (!existing) {
    throw AppError.notFound("CATEGORY_NOT_FOUND", "Category not found");
  }

  const countRow = await db.get(
    "SELECT COUNT(*) AS count FROM tasks WHERE category_id = ? AND user_id = ?",
    [id, userId],
  );

  await db.run("DELETE FROM categories WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);

  return { movedTasks: countRow?.count ?? 0 };
}
