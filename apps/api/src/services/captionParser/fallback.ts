// Non-AI fallback parser (CLAUDE.md: always have a non-AI fallback). Used when there is
// no Gemini key, Gemini fails, or its output doesn't validate.
import type { Category } from "@engageplus/shared";
import { nyDateString } from "../../lib/time.js";
import { findDate, findTimes } from "./fallbackDateTime.js";
import type { LocalFields } from "./normalize.js";

// Emojis, flags, and the joiner / variation / keycap marks that glue them together.
const EMOJI_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u{FE0F}|\u{200D}|\u{20E3}/gu;
const LOCATION_RE = /(?:📍|\b(?:location|where|venue|place)\s*[:\-–])\s*([^\n]+)/iu;

const CATEGORY_KEYWORDS: Record<Exclude<Category, "OTHER">, RegExp> = {
  PROFESSIONAL:
    /\b(career|resume|résumé|internship|networking|recruit\w*|interview\w*|linkedin|professional|employer|job)\b/gi,
  ACADEMIC: /\b(study|studying|tutor\w*|lecture|seminar|research|exam|midterm|finals|academic|homework)\b/gi,
  CULTURAL:
    /\b(culture|cultural|heritage|diaspora|caribbean|african|latin[oax]?|festival|step show|poetry|art|dance)\b/gi,
  SOCIAL: /\b(party|mixer|social|game night|kickback|cookout|hangout|movie night|karaoke|skate)\b/gi,
};

/** Removes emojis and hashtags, collapses whitespace, trims stray separators. */
export function cleanLine(line: string): string {
  return line
    .replace(EMOJI_RE, " ")
    .replace(/#[\p{L}\p{N}_]+/gu, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s:|\-–—•*]+|[\s:|\-–—•*]+$/g, "")
    .trim();
}

function findTitle(caption: string): string | null {
  for (const line of caption.split(/\r?\n/)) {
    const cleaned = cleanLine(line);
    if (/\p{L}/u.test(cleaned)) return cleaned.slice(0, 120);
  }
  return null;
}

function findLocation(caption: string): string | null {
  const m = LOCATION_RE.exec(caption);
  const loc = m?.[1] ? cleanLine(m[1]) : "";
  return loc ? loc.slice(0, 200) : null;
}

/** Picks the category with the most keyword hits; null on no hits or a tie. */
export function guessCategory(caption: string): Category | null {
  let best: Category | null = null;
  let bestScore = 0;
  let tie = false;
  for (const [category, re] of Object.entries(CATEGORY_KEYWORDS) as [Category, RegExp][]) {
    const score = caption.match(re)?.length ?? 0;
    if (score > bestScore) {
      best = category;
      bestScore = score;
      tie = false;
    } else if (score > 0 && score === bestScore) {
      tie = true;
    }
  }
  return tie ? null : best;
}

export function fallbackParse(caption: string, now: Date): LocalFields {
  const { startTime, endTime } = findTimes(caption);
  const description = caption.trim().slice(0, 2000);
  return {
    title: findTitle(caption),
    description: description || null,
    category: guessCategory(caption),
    location: findLocation(caption),
    date: findDate(caption, nyDateString(now)),
    startTime,
    endTime,
  };
}
