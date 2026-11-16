/**
 * Timezone helpers.
 *
 * Tasks store absolute UTC timestamps (ISO 8601 with Z). "Today", "upcoming"
 * and "overdue" must follow each user's local calendar day, so the client
 * sends its `getTimezoneOffset()` value (minutes as UTC - local) with
 * analytics and due-date queries.
 *
 * wall clock time = utc time - tzOffset minutes
 */
export function normalizeTzOffset(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  // Real offsets range from UTC-12 to UTC+14.
  return Math.max(-840, Math.min(840, Math.trunc(value)));
}

/** Start of the user's local day, expressed as a real UTC Date. */
export function startOfLocalDayUtc(tzOffset, reference = new Date()) {
  const wall = new Date(reference.getTime() - tzOffset * 60_000);
  const wallMidnight = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate(),
  );
  return new Date(wallMidnight + tzOffset * 60_000);
}

/** ISO range [start, end) covering the user's local day (or n days from it). */
export function localDayRangeIso(tzOffset, { days = 1, fromDays = 0 } = {}) {
  const base = startOfLocalDayUtc(tzOffset, new Date());
  const start = new Date(base.getTime() + fromDays * 86_400_000);
  const end = new Date(start.getTime() + days * 86_400_000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

/** Local calendar date key (YYYY-MM-DD) for an absolute timestamp. */
export function localDateKey(isoString, tzOffset) {
  const wallMs = Date.parse(isoString) - tzOffset * 60_000;
  return new Date(wallMs).toISOString().slice(0, 10);
}

/** The last `days` local date keys, oldest first, ending today. */
export function lastLocalDayKeys(tzOffset, days = 7) {
  const keys = [];
  const todayStart = startOfLocalDayUtc(tzOffset, new Date());
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const start = new Date(todayStart.getTime() - offset * 86_400_000);
    keys.push(localDateKey(start.toISOString(), tzOffset));
  }
  return keys;
}
