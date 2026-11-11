// Prisma FeedbackRepo. Uses Swipe(target EVENT, action RIGHT) as "RSVP'd" and the
// EventFeedback @@unique([userId, eventId]) for one changeable rating. Needs TR3 migrations.
import type { PrismaClient } from "@prisma/client";
import type { FeedbackRepo } from "./index.js";

export function prismaFeedbackRepo(prisma: () => PrismaClient): FeedbackRepo {
  return {
    async listRsvpedEnded(userId, { endedAfter, endedBefore }) {
      const rows = await prisma().event.findMany({
        where: {
          endsAt: { gte: endedAfter, lte: endedBefore },
          swipes: { some: { userId, target: "EVENT", action: "RIGHT" } },
        },
        orderBy: { endsAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          startsAt: true,
          endsAt: true,
          org: { select: { name: true } },
          feedback: { where: { userId }, select: { id: true }, take: 1 },
        },
      });
      return rows.map(({ org, feedback, ...e }) => ({ ...e, orgName: org.name, rated: feedback.length > 0 }));
    },

    async getEventForUser(userId, eventId) {
      const row = await prisma().event.findUnique({
        where: { id: eventId },
        select: {
          endsAt: true,
          swipes: { where: { userId, target: "EVENT", action: "RIGHT" }, select: { id: true }, take: 1 },
        },
      });
      return row && { endsAt: row.endsAt, rsvped: row.swipes.length > 0 };
    },

    async upsertFeedback(userId, eventId, thumbsUp) {
      await prisma().eventFeedback.upsert({
        where: { userId_eventId: { userId, eventId } },
        create: { userId, eventId, thumbsUp },
        update: { thumbsUp },
      });
    },
  };
}
