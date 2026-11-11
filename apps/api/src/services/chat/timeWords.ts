// Time words -> concrete New York time window (F16_03, TC-36). Parsed server-side,
// never by the AI, so "this afternoon" always means the same thing (architecture.md).
import { addDays, nyDateString, nyLocalToUtc, weekdayOf } from "../../lib/time.js";

export interface TimeWindow {
  label: string;
  from: Date;
  to: Date;
  /** "overlap": in-progress events count (for "now"). "start": event must start inside. */
  match: "overlap" | "start";
}

/** Parts of a day, New York wall clock. "night" runs past midnight. */
const PARTS = {
  morning: ["05:00", "12:00"],
  afternoon: ["12:00", "17:00"],
  evening: ["17:00", "21:00"],
  night: ["17:00", "03:00"],
} as const;
type DayPart = keyof typeof PARTS;

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const NOW_RE = /\b(right now|happening now|now|going on|at the moment|currently)\b/i;
const PART_RE = /\b(morning|afternoon|evening|night|tonight)\b/i;
const NOW_WINDOW_MS = 2 * 60 * 60 * 1000;

function partWindow(date: string, part: DayPart): { from: Date; to: Date } {
  const [start, end] = PARTS[part];
  const endDate = end < start ? addDays(date, 1) : date;
  return { from: nyLocalToUtc(date, start), to: nyLocalToUtc(endDate, end) };
}

function wholeDay(date: string): { from: Date; to: Date } {
  return { from: nyLocalToUtc(date, "00:00"), to: nyLocalToUtc(addDays(date, 1), "00:00") };
}

/** Never start a window in the past: "this afternoon" at 3pm means 3pm–5pm. */
function clamp(w: { from: Date; to: Date }, now: Date): { from: Date; to: Date } {
  return { from: w.from < now ? now : w.from, to: w.to };
}

function findPart(text: string): DayPart | null {
  const m = PART_RE.exec(text);
  if (!m?.[1]) return null;
  const word = m[1].toLowerCase();
  return word === "tonight" ? "night" : (word as DayPart);
}

/** Which calendar day the message refers to, if any, plus its label prefix. */
function findDay(text: string, today: string): { date: string; label: string } | null {
  if (/\btomorrow\b/i.test(text)) return { date: addDays(today, 1), label: "tomorrow" };
  if (/\b(today|tonight|this (morning|afternoon|evening))\b/i.test(text)) return { date: today, label: "today" };
  const m = /\b(?:on |this |next )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i.exec(text);
  if (m?.[1]) {
    const target = WEEKDAYS.indexOf(m[1].toLowerCase());
    let diff = (target - weekdayOf(today) + 7) % 7;
    if (/\bnext\s+\w+day\b/i.test(text) && diff === 0) diff = 7;
    return { date: addDays(today, diff), label: m[1][0]?.toUpperCase() + m[1].slice(1).toLowerCase() };
  }
  return null;
}

export function parseTimeWindow(message: string, now: Date): TimeWindow | null {
  const text = message.toLowerCase();
  const today = nyDateString(now);

  if (/\b(this|the) weekend\b|\bweekend\b/.test(text)) {
    const dow = weekdayOf(today);
    const saturday = dow === 6 || dow === 0 ? (dow === 6 ? today : addDays(today, -1)) : addDays(today, 6 - dow);
    const w = clamp({ from: nyLocalToUtc(saturday, "00:00"), to: nyLocalToUtc(addDays(saturday, 2), "00:00") }, now);
    return { label: "this weekend", ...w, match: "start" };
  }
  if (/\bthis week\b/.test(text)) {
    const daysToMonday = ((8 - weekdayOf(today)) % 7) || 7;
    return { label: "this week", from: now, to: nyLocalToUtc(addDays(today, daysToMonday), "00:00"), match: "start" };
  }

  const day = findDay(text, today);
  const part = findPart(text);

  if (!day && !part && NOW_RE.test(text)) {
    return { label: "right now", from: now, to: new Date(now.getTime() + NOW_WINDOW_MS), match: "overlap" };
  }
  if (!day && !part) {
    if (/\blater\b/.test(text)) return { label: "later today", ...clamp(wholeDay(today), now), match: "start" };
    return null;
  }

  const date = day?.date ?? today;
  const base = part ? partWindow(date, part) : wholeDay(date);
  const partLabel = part === "night" ? "night" : part;
  let label: string;
  if (!day || day.label === "today") label = part === "night" ? "tonight" : part ? `this ${partLabel}` : "today";
  else label = part ? `${day.label} ${partLabel}` : day.label;

  return { label, ...clamp(base, now), match: "start" };
}

export function inWindow(event: { startsAt: Date; endsAt: Date }, w: TimeWindow): boolean {
  if (w.match === "overlap") return event.startsAt < w.to && event.endsAt > w.from;
  return event.startsAt >= w.from && event.startsAt < w.to;
}
