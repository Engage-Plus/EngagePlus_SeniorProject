// In-memory FeedbackRepo for tests. Mirrors the Prisma repo's query semantics.
import type { FeedbackRepo } from "./index.js";

export const NOW = new Date("2026-11-11T17:00:00Z");
const HOUR = 3600_000;

interface MemEvent {
  id: string;
  title: string;
  orgName: string;
  startsAt: Date;
  endsAt: Date;
}

export function memoryRepo() {
  const events = new Map<string, MemEvent>();
  const rsvps = new Set<string>(); // `${userId}:${eventId}`
  const ratings = new Map<string, boolean>();
  const key = (u: string, e: string) => `${u}:${e}`;

  const repo: FeedbackRepo = {
    async listRsvpedEnded(userId, { endedAfter, endedBefore }) {
      return [...events.values()]
        .filter((e) => rsvps.has(key(userId, e.id)) && e.endsAt >= endedAfter && e.endsAt <= endedBefore)
        .map((e) => ({ ...e, rated: ratings.has(key(userId, e.id)) }));
    },
    async getEventForUser(userId, eventId) {
      const e = events.get(eventId);
      return e ? { endsAt: e.endsAt, rsvped: rsvps.has(key(userId, eventId)) } : null;
    },
    async upsertFeedback(userId, eventId, thumbsUp) {
      ratings.set(key(userId, eventId), thumbsUp);
    },
  };

  return {
    repo,
    /** Adds an event ending `endedHoursAgo` before NOW (negative = still upcoming). */
    addEvent(id: string, endedHoursAgo: number, rsvpBy: string[] = []) {
      const endsAt = new Date(NOW.getTime() - endedHoursAgo * HOUR);
      events.set(id, { id, title: `Event ${id}`, orgName: "Test Org", startsAt: new Date(endsAt.getTime() - 2 * HOUR), endsAt });
      for (const u of rsvpBy) rsvps.add(key(u, id));
    },
    rating: (userId: string, eventId: string) => ratings.get(key(userId, eventId)),
  };
}
