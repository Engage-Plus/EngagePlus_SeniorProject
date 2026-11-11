// POST /events/parse-caption contract (F14_01, US-6.1, TC-27).
// The parser only *suggests* fields; the org always reviews them before publishing (US-6.3).
import { z } from "zod";
import { CategorySchema } from "./enums.js";

export const CAPTION_MAX_LENGTH = 5000;

export const ParseCaptionRequestSchema = z.object({
  caption: z.string().trim().min(1, "Paste a caption first").max(CAPTION_MAX_LENGTH),
});
export type ParseCaptionRequest = z.infer<typeof ParseCaptionRequestSchema>;

/** "YYYY-MM-DD", a calendar date in America/New_York. */
export const LocalDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** "HH:MM", 24-hour wall-clock time in America/New_York. */
export const LocalTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

/** Every field is present; anything the caption didn't state is null (TC-27). */
export const ParsedEventFieldsSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  category: CategorySchema.nullable(),
  location: z.string().nullable(),
  /** Local date/time as written in the caption, for the review form inputs. */
  date: LocalDateSchema.nullable(),
  startTime: LocalTimeSchema.nullable(),
  endTime: LocalTimeSchema.nullable(),
  /** Same moment in UTC (what gets stored); null unless date and start time are known. */
  startsAt: z.iso.datetime().nullable(),
  endsAt: z.iso.datetime().nullable(),
});
export type ParsedEventFields = z.infer<typeof ParsedEventFieldsSchema>;

export const ParseCaptionResponseSchema = z.object({
  fields: ParsedEventFieldsSchema,
  /** "ai" = Gemini; "fallback" = the basic non-AI parser (no key, quota hit, or bad AI output). */
  source: z.enum(["ai", "fallback"]),
  /** Plain-language hints to show on the review form, e.g. "No start time found". */
  warnings: z.array(z.string()),
});
export type ParseCaptionResponse = z.infer<typeof ParseCaptionResponseSchema>;
