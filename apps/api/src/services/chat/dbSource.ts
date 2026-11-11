// Prisma-backed CandidateSource for POST /chat. Published events only (drafts from the
// caption parser / extension stay hidden). Needs TR3 migrations to run against a real DB.
import type { PrismaClient } from "@prisma/client";
import type { CandidateSource } from "./types.js";

export const MAX_CANDIDATES = 200;

export function prismaCandidateSource(prisma: () => PrismaClient): CandidateSource {
  return async ({ from, to }) => {
    const rows = await prisma().event.findMany({
      where: { publishedAt: { not: null }, endsAt: { gt: from }, startsAt: { lt: to } },
      orderBy: { startsAt: "asc" },
      take: MAX_CANDIDATES,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        location: true,
        startsAt: true,
        endsAt: true,
        org: { select: { name: true } },
      },
    });
    return rows.map(({ org, ...e }) => ({ ...e, orgName: org.name }));
  };
}
