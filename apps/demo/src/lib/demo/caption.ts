import type { Category } from "./types";
import { etDate, etParts, etToUtc } from "./time";

// Rule-based Instagram caption parser (F14). In production the API asks Gemini for JSON
// first and falls back to rules like these; the demo runs only the fallback, in the browser.

export interface ParsedCaption {
  title: string;
  description: string;
  category: Category;
  location: string;
  starts_at: string | null;
  ends_at: string | null;
  is_free: boolean;
  found: { title: boolean; date: boolean; time: boolean; location: boolean };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const VENUES = [
  "Blackburn Center",
  "Blackburn Ballroom",
  "Blackburn Game Room",
  "Cramton Auditorium",
  "Founders Library",
  "Douglass Hall",
  "The Yard",
  "Burr Gymnasium",
  "iLab",
  "School of Business",
  "Annex III",
  "Career Center",
];
const KEYWORDS: Record<Category, string[]> = {
  academic: [
    "workshop",
    "study",
    "hack",
    "lecture",
    "tutor",
    "mcat",
    "lsat",
    "research",
    "coding",
    "code",
    "class",
  ],
  professional: [
    "career",
    "resume",
    "recruit",
    "network",
    "internship",
    "panel",
    "interview",
    "professional",
    "mixer",
  ],
  cultural: [
    "culture",
    "heritage",
    "poetry",
    "step",
    "dance",
    "carnival",
    "soca",
    "art",
    "open mic",
    "festival",
  ],
  social: ["party", "game", "tournament", "kickback", "yoga", "fun", "social", "night", "chill"],
};

interface YMD {
  y: number;
  m: number;
  d: number;
}

function findDate(text: string, now: Date): YMD | null {
  const today = etParts(now);
  const fromOffset = (days: number): YMD => {
    const p = etParts(etDate(now, days, 12));
    return { y: p.year, m: p.month, d: p.day };
  };
  const named =
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i.exec(
      text,
    );
  const numeric = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/.exec(text);
  let ymd: YMD | null = null;
  if (named)
    ymd = {
      y: today.year,
      m: MONTHS.indexOf((named[1] ?? "").slice(0, 3).toLowerCase()) + 1,
      d: Number(named[2]),
    };
  else if (numeric) {
    const y = numeric[3]
      ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3])
      : today.year;
    ymd = { y, m: Number(numeric[1]), d: Number(numeric[2]) };
  }
  if (ymd) {
    // "Jan 10" written in November means next January.
    const asDate = Date.UTC(ymd.y, ymd.m - 1, ymd.d);
    if (asDate < Date.UTC(today.year, today.month - 1, today.day) - 30 * 864e5) ymd.y += 1;
    return ymd;
  }
  if (/\btomorrow\b/i.test(text)) return fromOffset(1);
  if (/\b(today|tonight)\b/i.test(text)) return fromOffset(0);
  const wd =
    /\b(this\s+|next\s+)?(sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:rs(?:day)?)?|fri(?:day)?|sat(?:urday)?)\b/i.exec(
      text,
    );
  if (wd) {
    let diff = (WEEKDAYS.indexOf((wd[2] ?? "").slice(0, 3).toLowerCase()) - today.weekday + 7) % 7;
    if (diff === 0 && /next/i.test(wd[1] ?? "")) diff = 7;
    return fromOffset(diff);
  }
  return null;
}

const to24 = (h: number, mer: string | undefined) => {
  const pm = mer?.toLowerCase() === "pm";
  if (h === 12) return pm ? 12 : 0;
  return pm ? h + 12 : h;
};

function findTimes(text: string): { start: [number, number]; end: [number, number] | null } | null {
  const range =
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i.exec(
      text,
    );
  if (range) {
    const endH = to24(Number(range[4]), range[6]);
    let startH = to24(Number(range[1]), range[3] ?? range[6]);
    if (!range[3] && startH > endH) startH -= 12; // "10-1pm" means 10am to 1pm
    return { start: [startH, Number(range[2] ?? 0)], end: [endH, Number(range[5] ?? 0)] };
  }
  const single = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i.exec(text);
  if (single)
    return { start: [to24(Number(single[1]), single[3]), Number(single[2] ?? 0)], end: null };
  return null;
}

function findLocation(text: string): string {
  const tagged = /(?:📍|location:|where:|venue:)\s*([^\n|•]+)/iu.exec(text);
  if (tagged?.[1]) return tagged[1].trim().replace(/[.!]+$/, "");
  const venue = VENUES.find((v) => text.toLowerCase().includes(v.toLowerCase()));
  if (venue) return venue;
  const at = /\bat\s+((?:the\s+)?[A-Z][\w'.&-]*(?:\s+[A-Z0-9][\w'.&-]*)*)/.exec(text);
  return at?.[1]?.trim() ?? "";
}

function findCategory(text: string): Category {
  const lower = text.toLowerCase();
  let best: Category = "social";
  let bestScore = 0;
  for (const [cat, words] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestScore) [best, bestScore] = [cat, score];
  }
  return best;
}

function cleanTitle(text: string): string {
  const firstLine =
    text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.replace(/[^\p{L}\p{N}]/gu, "").length > 0) ?? "";
  const stripped = firstLine
    .replace(/[#@]\w+/g, "")
    .replace(/[^\p{L}\p{N}\s'&:!?.,()-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const cut = stripped.length > 70 ? stripped.split(/[!.?]/)[0] : stripped;
  return (cut ?? "").replace(/[!.,:\s-]+$/, "").slice(0, 80);
}

export function parseCaption(text: string, now = new Date()): ParsedCaption {
  const title = cleanTitle(text);
  const date = findDate(text, now);
  const times = findTimes(text);
  const location = findLocation(text);
  let starts_at: string | null = null;
  let ends_at: string | null = null;
  if (date) {
    const [h, m] = times?.start ?? [18, 0];
    const start = etToUtc(date.y, date.m, date.d, h, m);
    starts_at = start.toISOString();
    if (times?.end) {
      let end = etToUtc(date.y, date.m, date.d, times.end[0], times.end[1]);
      if (end <= start) end = new Date(end.getTime() + 864e5); // past midnight
      ends_at = end.toISOString();
    }
  }
  const description = text
    .split("\n")
    .filter((l) => !/^\s*(#\w+\s*)+$/.test(l))
    .join("\n")
    .trim()
    .slice(0, 500);
  return {
    title,
    description,
    category: findCategory(text),
    location,
    starts_at,
    ends_at,
    is_free: /\$\s?\d/.test(text) ? false : true,
    found: { title: !!title, date: !!date, time: !!times, location: !!location },
  };
}

export const EXAMPLE_CAPTIONS = [
  `🎄 Winter Code Jam 🎄\nBison Coders is hosting our last build night of the semester! Pizza, mentors and prizes.\nFriday 6-9pm\n📍 iLab, Founders Library\nFree for all majors 💻 #BisonCoders #HU`,
  `HACK THE MECCA info session!! 🦬\nLearn how to join a team for spring's hackathon. Tomorrow at 7:30pm in Douglass Hall 116. Snacks provided!\n#hackathon #howard`,
];
