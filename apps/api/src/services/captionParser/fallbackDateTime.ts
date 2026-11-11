// Non-AI date and time extraction for the fallback parser. Deliberately simple:
// it covers common caption formats and returns null rather than guessing.
import { addDays, isValidLocalDate, weekdayOf } from "../../lib/time.js";

const MONTH_RE =
  /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b(?:,?\s*(\d{4}))?/i;
const NUMERIC_RE = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}|\d{2}))?\b/;
const WEEKDAY_RE = /\b(this\s+|next\s+)?(sun|mon|tues|wednes|thurs|fri|satur)day\b/i;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const WEEKDAYS = ["sun", "mon", "tues", "wednes", "thurs", "fri", "satur"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Builds a date; with no year, picks this year unless that was over a week ago. */
function buildDate(month: number, day: number, year: number | null, today: string): string | null {
  if (year !== null) {
    const full = year < 100 ? 2000 + year : year;
    const d = `${full}-${pad(month)}-${pad(day)}`;
    return isValidLocalDate(d) ? d : null;
  }
  const thisYear = Number(today.slice(0, 4));
  const d = `${thisYear}-${pad(month)}-${pad(day)}`;
  if (!isValidLocalDate(d)) return null;
  return d < addDays(today, -7) ? `${thisYear + 1}-${pad(month)}-${pad(day)}` : d;
}

/** `today` is New York's "YYYY-MM-DD". */
export function findDate(text: string, today: string): string | null {
  const m = MONTH_RE.exec(text);
  if (m?.[1] && m[2]) {
    const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1;
    return buildDate(month, Number(m[2]), m[3] ? Number(m[3]) : null, today);
  }
  const n = NUMERIC_RE.exec(text);
  if (n?.[1] && n[2]) return buildDate(Number(n[1]), Number(n[2]), n[3] ? Number(n[3]) : null, today);

  if (/\btomorrow\b/i.test(text)) return addDays(today, 1);
  if (/\b(today|tonight)\b/i.test(text)) return today;

  const w = WEEKDAY_RE.exec(text);
  if (w?.[2]) {
    const target = WEEKDAYS.indexOf(w[2].toLowerCase());
    let diff = (target - weekdayOf(today) + 7) % 7;
    if (w[1]?.trim().toLowerCase() === "next" && diff === 0) diff = 7;
    return addDays(today, diff);
  }
  return null;
}

const MERIDIEM = "(am|pm|a\\.m\\.|p\\.m\\.)";
const RANGE_RE = new RegExp(
  `\\b(\\d{1,2})(?::(\\d{2}))?\\s*${MERIDIEM}?\\s*(?:-|–|—|to|until)\\s*(\\d{1,2})(?::(\\d{2}))?\\s*${MERIDIEM}`,
  "i",
);
const SINGLE_RE = new RegExp(`\\b(\\d{1,2})(?::(\\d{2}))?\\s*${MERIDIEM}`, "i");

function to24(hour: number, minute: number, meridiem: string): string | null {
  if (hour < 1 || hour > 12 || minute > 59) return null;
  const pm = meridiem.toLowerCase().startsWith("p");
  return `${pad((hour % 12) + (pm ? 12 : 0))}:${pad(minute)}`;
}

export function findTimes(text: string): { startTime: string | null; endTime: string | null } {
  const r = RANGE_RE.exec(text);
  if (r?.[1] && r[4] && r[6]) {
    const endTime = to24(Number(r[4]), Number(r[5] ?? 0), r[6]);
    // "7-9pm": the start borrows the end's am/pm; "11-1pm" means 11am.
    let startTime = to24(Number(r[1]), Number(r[2] ?? 0), r[3] ?? r[6]);
    if (!r[3] && startTime && endTime && startTime > endTime) {
      startTime = to24(Number(r[1]), Number(r[2] ?? 0), "am");
    }
    return { startTime, endTime };
  }
  const s = SINGLE_RE.exec(text);
  if (s?.[1] && s[3]) return { startTime: to24(Number(s[1]), Number(s[2] ?? 0), s[3]), endTime: null };
  if (/\bnoon\b/i.test(text)) return { startTime: "12:00", endTime: null };
  return { startTime: null, endTime: null };
}
