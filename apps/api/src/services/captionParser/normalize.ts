// Turns local (New York) fields from either parser into the shared response shape,
// adding UTC instants and review warnings. Missing values stay null (TC-27).
import type { Category, ParsedEventFields } from "@engageplus/shared";
import { addDays, nyDateString, nyLocalToUtc } from "../../lib/time.js";

export interface LocalFields {
  title: string | null;
  description: string | null;
  category: Category | null;
  location: string | null;
  date: string | null; // YYYY-MM-DD, America/New_York
  startTime: string | null; // HH:MM, America/New_York
  endTime: string | null;
}

export interface Normalized {
  fields: ParsedEventFields;
  warnings: string[];
}

export function toParsedFields(local: LocalFields, now: Date): Normalized {
  const warnings: string[] = [];
  const { date, startTime, endTime } = local;

  if (!local.title) warnings.push("No title found. Please add one.");
  if (!date) warnings.push("No date found. Please add one.");
  else if (date < addDays(nyDateString(now), -1)) {
    warnings.push("The date looks like it's in the past. Please check it.");
  }
  if (!startTime) warnings.push("No start time found. Please add one.");

  const startsAt = date && startTime ? nyLocalToUtc(date, startTime) : null;
  let endsAt: Date | null = null;
  if (date && startTime && endTime && endTime !== startTime) {
    // "10pm-1am" ends the next day.
    endsAt = nyLocalToUtc(endTime < startTime ? addDays(date, 1) : date, endTime);
  }

  return {
    fields: {
      ...local,
      startsAt: startsAt?.toISOString() ?? null,
      endsAt: endsAt?.toISOString() ?? null,
    },
    warnings,
  };
}
