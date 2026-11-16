import { getDb } from "../db/connection.js";
import {
  lastLocalDayKeys,
  localDateKey,
  localDayRangeIso,
  startOfLocalDayUtc,
} from "../utils/time.js";

/**
 * All metrics are computed from the user's own rows — nothing is estimated.
 * A single lightweight query keeps this readable; analytics for a personal
 * task list does not need SQL window functions.
 */
async function loadTaskFacts(userId) {
  const db = await getDb();
  const [tasks, categories] = await Promise.all([
    db.all(
      `SELECT id, status, priority, due_at, completed_at, category_id
         FROM tasks WHERE user_id = ?`,
      [userId],
    ),
    db.all(
      `SELECT id, name, color FROM categories WHERE user_id = ? ORDER BY name COLLATE NOCASE`,
      [userId],
    ),
  ]);
  return { tasks, categories };
}

export async function getSummary(userId, tzOffset) {
  const { tasks, categories } = await loadTaskFacts(userId);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  const today = localDayRangeIso(tzOffset, { days: 1 });
  const week = localDayRangeIso(tzOffset, { days: 7 });
  const todayKey = localDateKey(nowIso, tzOffset);

  let completed = 0;
  let pending = 0;
  let inProgress = 0;
  let overdue = 0;
  let dueToday = 0;
  let upcoming = 0;
  let completedToday = 0;

  const byPriority = { low: 0, medium: 0, high: 0 };
  const categoryCounts = new Map();
  let uncategorized = 0;

  for (const task of tasks) {
    if (task.status === "completed") {
      completed += 1;
      if (task.completed_at && localDateKey(task.completed_at, tzOffset) === todayKey) {
        completedToday += 1;
      }
    } else {
      if (task.status === "pending") pending += 1;
      if (task.status === "in_progress") inProgress += 1;

      if (task.due_at) {
        const dueMs = Date.parse(task.due_at);
        if (dueMs < nowMs) overdue += 1;
        if (dueMs >= Date.parse(week.startIso) && dueMs < Date.parse(week.endIso)) {
          upcoming += 1;
        }
        if (dueMs >= Date.parse(today.startIso) && dueMs < Date.parse(today.endIso)) {
          dueToday += 1;
        }
      }
    }

    byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;

    if (task.category_id) {
      categoryCounts.set(
        task.category_id,
        (categoryCounts.get(task.category_id) ?? 0) + 1,
      );
    } else {
      uncategorized += 1;
    }
  }

  const total = tasks.length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const byCategory = categories.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
    count: categoryCounts.get(category.id) ?? 0,
  }));

  if (uncategorized > 0) {
    byCategory.push({
      id: null,
      name: "Uncategorized",
      color: "#94a3b8",
      count: uncategorized,
    });
  }

  return {
    total,
    completed,
    pending,
    inProgress,
    overdue,
    dueToday,
    upcoming,
    completedToday,
    completionRate,
    byPriority,
    byCategory,
  };
}

export async function getCompletions(userId, { days, tzOffset }) {
  const db = await getDb();
  const windowStart = new Date(
    startOfLocalDayUtc(tzOffset).getTime() - (days - 1) * 86_400_000,
  ).toISOString();

  const rows = await db.all(
    `SELECT completed_at FROM tasks
      WHERE user_id = ? AND completed_at IS NOT NULL AND completed_at >= ?`,
    [userId, windowStart],
  );

  const keys = lastLocalDayKeys(tzOffset, days);
  const counts = new Map(keys.map((key) => [key, 0]));

  for (const row of rows) {
    const key = localDateKey(row.completed_at, tzOffset);
    if (counts.has(key)) counts.set(key, counts.get(key) + 1);
  }

  return {
    days: keys.map((date) => ({ date, completed: counts.get(date) })),
    total: [...counts.values()].reduce((sum, value) => sum + value, 0),
  };
}
