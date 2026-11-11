// America/New_York <-> UTC helpers. Store UTC, display New York (CLAUDE.md code standards).
// Uses Intl only, so DST is handled by the runtime's tz database.

export const NY_TZ = "America/New_York";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: NY_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function nyWallClock(d: Date): WallClock {
  const p: Record<string, string> = {};
  for (const part of partsFormat.formatToParts(d)) p[part.type] = part.value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** New York's offset from UTC at instant `d`, in ms (e.g. -5h in winter). */
function nyOffsetMs(d: Date): number {
  const w = nyWallClock(d);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return asUtc - Math.floor(d.getTime() / 1000) * 1000;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Today's date in New York as "YYYY-MM-DD". */
export function nyDateString(d: Date): string {
  const w = nyWallClock(d);
  return `${w.year}-${pad(w.month)}-${pad(w.day)}`;
}

/** True for a real calendar date in "YYYY-MM-DD" form (rejects 2026-02-30). */
export function isValidLocalDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a "YYYY-MM-DD" date. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function weekdayName(date: string): string {
  return WEEKDAYS[weekdayOf(date)] ?? "";
}

const displayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: NY_TZ,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Fri, Nov 13, 6:00 PM" in New York time (for reasons and prompts). */
export function formatNy(d: Date): string {
  return displayFormat.format(d);
}

/** Converts a New York wall-clock date + "HH:MM" to the UTC instant. */
export function nyLocalToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const guess = Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0);
  // Two passes: the offset can change between the guess and the real instant (DST).
  let utc = guess - nyOffsetMs(new Date(guess));
  utc = guess - nyOffsetMs(new Date(utc));
  return new Date(utc);
}
