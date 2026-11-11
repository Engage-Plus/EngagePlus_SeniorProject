// POST /chat contract (F16_01–F16_03, US-7.1–7.3, TC-34–36).
// Results are always real events from our DB; the AI only picks from them (risk G2).
import { z } from "zod";
import { CategorySchema } from "./enums.js";

export const CHAT_MESSAGE_MAX_LENGTH = 500;

export const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Ask a question first").max(CHAT_MESSAGE_MAX_LENGTH),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatEventResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: CategorySchema,
  location: z.string().nullable(),
  orgName: z.string(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  /** One-line "why this result" (TC-35). Never empty. */
  reason: z.string().min(1),
});
export type ChatEventResult = z.infer<typeof ChatEventResultSchema>;

/** The time range a question was understood as, e.g. "this afternoon" (TC-36). */
export const ChatTimeWindowSchema = z.object({
  label: z.string(),
  from: z.iso.datetime(),
  to: z.iso.datetime(),
});
export type ChatTimeWindow = z.infer<typeof ChatTimeWindowSchema>;

export const ChatResponseSchema = z.object({
  /** Short conversational answer shown above the results. */
  reply: z.string(),
  /** null = no time words; results cover the next couple of weeks. */
  window: ChatTimeWindowSchema.nullable(),
  results: z.array(ChatEventResultSchema).max(5),
  source: z.enum(["ai", "fallback"]),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
