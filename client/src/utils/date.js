/**
 * Date helpers for the calendar and dashboard.
 *
 * Important: every function here works on the *local* timezone.
 * Tasks store an absolute timestamp (ISO string with offset) in the database,
 * but "today", "upcoming" and the calendar grid are all computed from the
 * browser's local calendar day. That keeps "Today" consistent for each user
 * instead of silently switching to UTC.
 */

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Midnight at the start of the given date, in local time. */
export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** First day of the month containing `date`, in local time. */
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Shift a date by a number of months (handles year rollover). */
export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Builds a fixed 6x7 grid of local dates for a month view, starting on Sunday.
 * Leading/trailing days belong to the previous/next month and are dimmed.
 */
export function buildMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function formatMonthYear(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatWeekday(date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(date);
}

/** "Good morning" / "Good afternoon" / "Good evening" based on local time. */
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
