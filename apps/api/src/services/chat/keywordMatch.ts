// Non-AI chat fallback: keyword overlap + category words, with a plain reason for
// every result (TC-35). Used when Gemini is off, fails, or returns nothing usable.
import type { Category } from "@engageplus/shared";
import { formatNy } from "../../lib/time.js";
import type { TimeWindow } from "./timeWords.js";
import type { ChatCandidate, Pick } from "./types.js";

const STOPWORDS = new Set(
  (
    "a an and any are anything at be can do event events for from going happening i in is it " +
    "me my of on or show some something that the there this to today tomorrow tonight what " +
    "whats when where which who with week weekend you afternoon morning evening night now right " +
    "later next find get want looking free fun near"
  ).split(" "),
);

const CATEGORY_WORDS: Record<Category, RegExp> = {
  ACADEMIC: /\b(study|studying|tutor\w*|academic|lecture|seminar|research|exam|class)\b/i,
  PROFESSIONAL: /\b(career|resume|internship|network\w*|professional|job|recruit\w*|interview)\b/i,
  CULTURAL: /\b(cultur\w*|heritage|diaspora|music|dance|art|poetry|festival)\b/i,
  SOCIAL: /\b(party|parties|social|mixer|hang\s?out|game|games|kickback|fun)\b/i,
  OTHER: /$^/, // never matched by words
};

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function describeWhen(event: ChatCandidate, window: TimeWindow | null): string {
  const when = formatNy(event.startsAt);
  const where = event.location ? ` at ${event.location}` : "";
  return window ? `Happening ${window.label} (${when})${where}` : `${when}${where}`;
}

/** Ranks candidates by keyword hits; with no keywords, lists the soonest events. */
export function keywordPicks(
  message: string,
  candidates: readonly ChatCandidate[],
  window: TimeWindow | null,
  limit = 5,
): Pick[] {
  const words = tokenize(message);
  const wantedCategories = (Object.keys(CATEGORY_WORDS) as Category[]).filter((c) => CATEGORY_WORDS[c].test(message));

  if (words.length === 0 && wantedCategories.length === 0) {
    return candidates.slice(0, limit).map((event) => ({ event, reason: describeWhen(event, window) }));
  }

  const scored = candidates.map((event) => {
    const haystack = `${event.title} ${event.description ?? ""} ${event.orgName}`.toLowerCase();
    const hits = words.filter((w) => haystack.includes(w));
    const categoryHit = wantedCategories.includes(event.category);
    return { event, hits, categoryHit, score: hits.length * 2 + (categoryHit ? 1 : 0) };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.event.startsAt.getTime() - b.event.startsAt.getTime())
    .slice(0, limit)
    .map(({ event, hits }) => {
      const why = hits.length
        ? `Mentions “${hits.slice(0, 2).join("”, “")}”`
        : `${event.category.charAt(0)}${event.category.slice(1).toLowerCase()} event`;
      return { event, reason: `${why} · ${describeWhen(event, window)}` };
    });
}
