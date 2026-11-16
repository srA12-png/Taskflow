/**
 * Task helpers shared by every view.
 * All day boundaries use the browser's local timezone.
 */

export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function pad(value) {
  return String(value).padStart(2, "0");
}

/** YYYY-MM-DD in local time for an ISO timestamp. */
export function localDateKey(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey() {
  return localDateKey(new Date().toISOString());
}

export function isOverdue(task, now = Date.now()) {
  return Boolean(
    task.status !== "completed" && task.dueAt && Date.parse(task.dueAt) < now,
  );
}

export function isDueToday(task) {
  return Boolean(task.dueAt) && localDateKey(task.dueAt) === todayKey();
}

export function isCompleted(task) {
  return task.status === "completed";
}

/** Date input value (YYYY-MM-DD) for a due timestamp. */
export function toDateInput(isoString) {
  return localDateKey(isoString) ?? "";
}

/** Time input value (HH:mm) for a due timestamp, empty when not set. */
export function toTimeInput(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Combines a local date and optional time into a UTC ISO timestamp.
 * A date without a time means end of day, so it stays "due today" all day
 * and only becomes overdue the next day.
 */
export function combineDueDateTime(dateValue, timeValue) {
  if (!dateValue) return null;
  const time = timeValue || "23:59";
  const date = new Date(`${dateValue}T${time}:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatDueLabel(dueAt, now = new Date()) {
  if (!dueAt) return { label: "No due date", tone: "muted" };
  const due = new Date(dueAt);
  const key = localDateKey(dueAt);
  const today = localDateKey(now.toISOString());

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const tomorrowKey = localDateKey(tomorrow.toISOString());

  const time = due.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateLabel = due.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  if (key === today) return { label: `Today · ${time}`, tone: "today" };
  if (key === tomorrowKey) return { label: `Tomorrow · ${time}`, tone: "soon" };

  const isPast = due.getTime() < now.getTime();
  return {
    label: `${dateLabel} · ${time}`,
    tone: isPast ? "past" : "future",
  };
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function withinNextDays(task, days) {
  if (!task.dueAt) return false;
  const due = new Date(task.dueAt);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return due >= start && due < end;
}

function matchesSearch(task, term) {
  if (!term) return true;
  const needle = term.toLowerCase();
  return (
    task.title.toLowerCase().includes(needle) ||
    (task.description ?? "").toLowerCase().includes(needle) ||
    (task.category?.name ?? "").toLowerCase().includes(needle)
  );
}

export function filterTasks(tasks, filters, now = Date.now()) {
  return tasks.filter((task) => {
    if (!matchesSearch(task, filters.search?.trim())) return false;
    if (filters.status && filters.status !== "all" && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }
    if (filters.categoryId && filters.categoryId !== "all") {
      if (filters.categoryId === "none") {
        if (task.category) return false;
      } else if (task.category?.id !== Number(filters.categoryId)) {
        return false;
      }
    }
    if (filters.due && filters.due !== "all") {
      if (filters.due === "today" && !isDueToday(task)) return false;
      if (filters.due === "week" && !withinNextDays(task, 7)) return false;
      if (filters.due === "overdue" && !isOverdue(task, now)) return false;
      if (filters.due === "none" && task.dueAt) return false;
    }
    return true;
  });
}

export function sortTasks(tasks, sort) {
  const copy = [...tasks];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id - b.id,
      );
    case "due":
      return copy.sort((a, b) => {
        if (!a.dueAt && !b.dueAt) return 0;
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return Date.parse(a.dueAt) - Date.parse(b.dueAt);
      });
    case "priority":
      return copy.sort(
        (a, b) =>
          (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) ||
          (a.dueAt ? Date.parse(a.dueAt) : Infinity) -
            (b.dueAt ? Date.parse(b.dueAt) : Infinity),
      );
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id,
      );
  }
}

export function groupByStatus(tasks) {
  return {
    pending: tasks.filter((task) => task.status === "pending"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    completed: tasks.filter((task) => task.status === "completed"),
  };
}
