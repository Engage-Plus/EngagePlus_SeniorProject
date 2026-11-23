// All times are stored in UTC and shown in America/New_York (CLAUDE.md code standards).
export const TZ = "America/New_York";

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  weekday: "short",
  hourCycle: "h23",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface EtParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
}

export function etParts(d: Date): EtParts {
  const get = (t: string) => partsFmt.formatToParts(d).find((p) => p.type === t)?.value ?? "0";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
    weekday: WEEKDAYS.indexOf(get("weekday")),
  };
}

/** Converts a wall-clock time in New York to a UTC Date (handles EST and EDT). */
export function etToUtc(year: number, month: number, day: number, hour: number, minute = 0): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  for (const offset of [5, 4]) {
    const guess = new Date(naive + offset * 3600e3);
    const p = etParts(guess);
    if (p.hour === hour && p.day === day) return guess;
  }
  return new Date(naive + 5 * 3600e3);
}

/** A New York wall-clock time `dayOffset` days after `ref`'s New York date. */
export function etDate(ref: Date, dayOffset: number, hour: number, minute = 0): Date {
  const p = etParts(ref);
  const shifted = new Date(Date.UTC(p.year, p.month - 1, p.day + dayOffset));
  return etToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    hour,
    minute,
  );
}

export function etDayKey(d: Date): string {
  const p = etParts(d);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Days from `ref` (1–7) until the next given weekday in New York. */
export function daysUntilWeekday(ref: Date, weekday: number): number {
  const diff = (weekday - etParts(ref).weekday + 7) % 7;
  return diff === 0 ? 7 : diff;
}

export function formatWhen(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short", timeZone: TZ }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ }),
  };
}

/** Value for an <input type="datetime-local"> showing New York time. */
export function toLocalInput(iso: string): string {
  const p = etParts(new Date(iso));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Reads an <input type="datetime-local"> value as New York time. */
export function fromLocalInput(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return new Date(value).toISOString();
  return etToUtc(
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
  ).toISOString();
}
