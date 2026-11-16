import { getDb } from "../db/connection.js";
import { AppError } from "../utils/AppError.js";
import { localDayRangeIso } from "../utils/time.js";

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function toTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: row.category_id
      ? { id: row.category_id, name: row.category_name, color: row.category_color }
      : null,
  };
}

async function assertCategoryBelongsToUser(userId, categoryId) {
  if (categoryId == null) return;
  const db = await getDb();
  const row = await db.get(
    "SELECT id FROM categories WHERE id = ? AND user_id = ?",
    [categoryId, userId],
  );
  if (!row) {
    throw AppError.badRequest(
      "INVALID_CATEGORY",
      "The selected category does not exist",
    );
  }
}

function buildFilters(userId, filters) {
  const clauses = ["t.user_id = ?"];
  const params = [userId];

  if (filters.search) {
    const like = `%${escapeLike(filters.search)}%`;
    clauses.push("(t.title LIKE ? ESCAPE '\\' OR t.description LIKE ? ESCAPE '\\')");
    params.push(like, like);
  }

  if (filters.status !== "all") {
    clauses.push("t.status = ?");
    params.push(filters.status);
  }

  if (filters.priority !== "all") {
    clauses.push("t.priority = ?");
    params.push(filters.priority);
  }

  if (filters.categoryId) {
    clauses.push("t.category_id = ?");
    params.push(filters.categoryId);
  }

  if (filters.due === "today") {
    const { startIso, endIso } = localDayRangeIso(filters.tzOffset, { days: 1 });
    clauses.push("t.due_at >= ? AND t.due_at < ?");
    params.push(startIso, endIso);
  } else if (filters.due === "upcoming") {
    const { startIso, endIso } = localDayRangeIso(filters.tzOffset, { days: 7 });
    clauses.push("t.due_at >= ? AND t.due_at < ?");
    params.push(startIso, endIso);
  } else if (filters.due === "overdue") {
    clauses.push("t.status <> 'completed' AND t.due_at IS NOT NULL AND t.due_at < ?");
    params.push(new Date().toISOString());
  }

  return { where: `WHERE ${clauses.join(" AND ")}`, params };
}

const SORT_CLAUSES = {
  newest: "t.created_at DESC, t.id DESC",
  oldest: "t.created_at ASC, t.id ASC",
  due: "t.due_at IS NULL ASC, t.due_at ASC, t.id DESC",
  priority:
    "CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC, t.due_at IS NULL, t.due_at ASC",
};

export async function listTasks(userId, filters) {
  const db = await getDb();
  const { where, params } = buildFilters(userId, filters);

  const totalRow = await db.get(
    `SELECT COUNT(*) AS count FROM tasks t ${where}`,
    params,
  );
  const total = totalRow?.count ?? 0;

  const offset = (filters.page - 1) * filters.limit;
  const rows = await db.all(
    `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON c.id = t.category_id AND c.user_id = t.user_id
       ${where}
       ORDER BY ${SORT_CLAUSES[filters.sort] ?? SORT_CLAUSES.newest}
       LIMIT ? OFFSET ?`,
    [...params, filters.limit, offset],
  );

  return {
    tasks: rows.map(toTask),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  };
}

export async function getTaskById(userId, taskId) {
  const db = await getDb();
  const row = await db.get(
    `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON c.id = t.category_id AND c.user_id = t.user_id
      WHERE t.id = ? AND t.user_id = ?`,
    [taskId, userId],
  );
  if (!row) {
    throw AppError.notFound("TASK_NOT_FOUND", "Task not found");
  }
  return toTask(row);
}

export async function createTask(userId, input) {
  const db = await getDb();
  await assertCategoryBelongsToUser(userId, input.categoryId);

  const now = new Date().toISOString();
  const completedAt = input.status === "completed" ? now : null;

  const result = await db.run(
    `INSERT INTO tasks
       (user_id, category_id, title, description, priority, status,
        due_at, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.categoryId,
      input.title,
      input.description,
      input.priority,
      input.status,
      input.dueAt,
      completedAt,
      now,
      now,
    ],
  );

  return getTaskById(userId, result.lastID);
}

export async function updateTask(userId, taskId, fields) {
  const db = await getDb();
  const existing = await db.get(
    "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
    [taskId, userId],
  );
  if (!existing) {
    throw AppError.notFound("TASK_NOT_FOUND", "Task not found");
  }

  if ("categoryId" in fields) {
    await assertCategoryBelongsToUser(userId, fields.categoryId);
  }

  const merged = {
    title: "title" in fields ? fields.title : existing.title,
    description: "description" in fields ? fields.description : existing.description,
    priority: "priority" in fields ? fields.priority : existing.priority,
    status: "status" in fields ? fields.status : existing.status,
    categoryId: "categoryId" in fields ? fields.categoryId : existing.category_id,
    dueAt: "dueAt" in fields ? fields.dueAt : existing.due_at,
  };

  // completion timestamp follows status, and is cleared when reopened
  let completedAt = existing.completed_at;
  if (merged.status === "completed") {
    completedAt = existing.completed_at ?? new Date().toISOString();
  } else {
    completedAt = null;
  }

  await db.run(
    `UPDATE tasks
        SET title = ?, description = ?, priority = ?, status = ?,
            category_id = ?, due_at = ?, completed_at = ?, updated_at = ?
      WHERE id = ? AND user_id = ?`,
    [
      merged.title,
      merged.description,
      merged.priority,
      merged.status,
      merged.categoryId,
      merged.dueAt,
      completedAt,
      new Date().toISOString(),
      taskId,
      userId,
    ],
  );

  return getTaskById(userId, taskId);
}

export async function deleteTask(userId, taskId) {
  const db = await getDb();
  const result = await db.run(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [taskId, userId],
  );
  if (result.changes === 0) {
    throw AppError.notFound("TASK_NOT_FOUND", "Task not found");
  }
}
