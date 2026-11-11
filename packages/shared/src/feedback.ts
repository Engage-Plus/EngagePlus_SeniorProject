// Post-event feedback contract (F5_01, US-1.5, TC-05).
// GET  /feedback/pending          -> RSVP'd events that ended recently and aren't rated yet
// POST /feedback/:eventId {thumbsUp} -> save (or change) the rating
import { z } from "zod";

export const PendingFeedbackEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  orgName: z.string(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});
export type PendingFeedbackEvent = z.infer<typeof PendingFeedbackEventSchema>;

export const PendingFeedbackResponseSchema = z.object({
  events: z.array(PendingFeedbackEventSchema),
});
export type PendingFeedbackResponse = z.infer<typeof PendingFeedbackResponseSchema>;

export const SubmitFeedbackRequestSchema = z.object({ thumbsUp: z.boolean() });
export type SubmitFeedbackRequest = z.infer<typeof SubmitFeedbackRequestSchema>;

export const SubmitFeedbackResponseSchema = z.object({
  eventId: z.string(),
  thumbsUp: z.boolean(),
});
export type SubmitFeedbackResponse = z.infer<typeof SubmitFeedbackResponseSchema>;
