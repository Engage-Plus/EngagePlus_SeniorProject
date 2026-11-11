// Inputs to the feed ranker (F3_01). Plain data, no Prisma, so the scorer is easy to
// test (risk G3). The feed route (after TR3) loads these from the DB.
import type { Category, SwipeAction } from "@engageplus/shared";

export interface RankProfile {
  /** Quiz answers (F1). Empty = quiz not taken. */
  interests: Category[];
  involvement: string | null;
  followedOrgIds: ReadonlySet<string>;
  /** Past event swipes, newest last. Used for category and org affinity. */
  swipes: readonly { category: Category; orgId: string; action: SwipeAction }[];
}

export interface RankCandidate {
  id: string;
  orgId: string;
  /** Co-host orgs (F19). A follow on any of them counts. */
  cohostOrgIds?: readonly string[];
  title: string;
  category: Category;
  startsAt: Date;
  /** RIGHT swipes so far; drives the trending signal (F4). */
  rsvpCount: number;
}

export interface ScoredEvent {
  event: RankCandidate;
  score: number;
  /** Short machine-readable reasons, e.g. "interest", "follows" (handy for UI and debugging). */
  reasons: string[];
}

export interface RankedFeed {
  events: ScoredEvent[];
  /** "ai" = Gemini re-ranked the top; "deterministic" = score only; "trending" = cold start. */
  strategy: "ai" | "deterministic" | "trending";
}
