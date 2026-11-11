// Post-event feedback (F5_01, US-1.5, TC-05): after an RSVP'd event ends, ask for a
// thumbs up/down. Ratings feed recommendations (F3) and org analytics (F8_02).
import type { PendingFeedbackEvent } from "@engageplus/shared";
import { HttpError } from "../../middleware/errors.js";

/** Only prompt for events that ended within this many days. */
export const PROMPT_WINDOW_DAYS = 14;
export const MAX_PENDING = 3;

export interface RsvpedEvent {
  id: string;
  title: string;
  orgName: string;
  startsAt: Date;
  endsAt: Date;
  /** True if this user already rated it. */
  rated: boolean;
}

/** Data access, so the rules below are testable without a database. */
export interface FeedbackRepo {
  /** Events the user RSVP'd to (RIGHT swipe) that ended in [endedAfter, endedBefore]. */
  listRsvpedEnded(userId: string, range: { endedAfter: Date; endedBefore: Date }): Promise<RsvpedEvent[]>;
  /** null if the event doesn't exist. */
  getEventForUser(userId: string, eventId: string): Promise<{ endsAt: Date; rsvped: boolean } | null>;
  /** Insert or change the user's rating (one per user per event). */
  upsertFeedback(userId: string, eventId: string, thumbsUp: boolean): Promise<void>;
}

export interface FeedbackDeps {
  repo: FeedbackRepo;
  now?: () => Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** TC-05: the prompt appears only after the end time, for RSVP'd, unrated events. */
export async function listPendingFeedback(userId: string, deps: FeedbackDeps): Promise<PendingFeedbackEvent[]> {
  const now = deps.now?.() ?? new Date();
  const events = await deps.repo.listRsvpedEnded(userId, {
    endedAfter: new Date(now.getTime() - PROMPT_WINDOW_DAYS * DAY_MS),
    endedBefore: now,
  });
  return events
    .filter((e) => !e.rated && e.endsAt <= now) // re-checked in code, not just in SQL
    .sort((a, b) => b.endsAt.getTime() - a.endsAt.getTime()) // most recent first
    .slice(0, MAX_PENDING)
    .map((e) => ({
      id: e.id,
      title: e.title,
      orgName: e.orgName,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt.toISOString(),
    }));
}

/** TC-05: the rating saves. Only attendees (RSVP'd) can rate, and only after the event ends. */
export async function submitFeedback(
  userId: string,
  eventId: string,
  thumbsUp: boolean,
  deps: FeedbackDeps,
): Promise<void> {
  const now = deps.now?.() ?? new Date();
  const event = await deps.repo.getEventForUser(userId, eventId);
  if (!event) throw new HttpError(404, "Event not found");
  if (!event.rsvped) throw new HttpError(403, "Only students who RSVP'd can rate this event");
  if (event.endsAt > now) throw new HttpError(409, "You can rate this event after it ends");
  await deps.repo.upsertFeedback(userId, eventId, thumbsUp);
}
