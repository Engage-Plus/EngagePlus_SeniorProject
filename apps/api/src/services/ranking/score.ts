// Deterministic feed score (F3_01, TC-02): quiz answers first, then swipe history,
// follows, trending and "happening soon". Pure and repeatable; the AI layer only reorders.
import type { Category } from "@engageplus/shared";
import type { RankCandidate, RankProfile, ScoredEvent } from "./types.js";

/** Tunable weights. Quiz interest is the strongest single signal by design (US-1.2). */
export const WEIGHTS = {
  interest: 3,
  categoryHistory: 2, // max +/- from swipe history per category
  orgHistory: 1.5, // max +/- from swipes on this org's events
  follows: 2.5,
  trending: 1.5, // max
  soon: 0.5, // max, fades out over SOON_DAYS
} as const;

const SOON_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Affinity {
  right: number;
  left: number;
}

/** Smoothed like/dislike ratio in [-1, 1]; a couple of swipes barely move it. */
function affinity(a: Affinity | undefined): number {
  if (!a) return 0;
  return (a.right - a.left) / (a.right + a.left + 2);
}

function tally<K extends string>(entries: readonly { key: K; right: boolean }[]): Map<K, Affinity> {
  const map = new Map<K, Affinity>();
  for (const { key, right } of entries) {
    const a = map.get(key) ?? { right: 0, left: 0 };
    if (right) a.right += 1;
    else a.left += 1;
    map.set(key, a);
  }
  return map;
}

export interface ScoringContext {
  interests: ReadonlySet<Category>;
  followed: ReadonlySet<string>;
  byCategory: Map<Category, Affinity>;
  byOrg: Map<string, Affinity>;
  maxRsvps: number;
  now: Date;
}

export function buildContext(profile: RankProfile, candidates: readonly RankCandidate[], now: Date): ScoringContext {
  return {
    interests: new Set(profile.interests),
    followed: profile.followedOrgIds,
    byCategory: tally(profile.swipes.map((s) => ({ key: s.category, right: s.action === "RIGHT" }))),
    byOrg: tally(profile.swipes.map((s) => ({ key: s.orgId, right: s.action === "RIGHT" }))),
    maxRsvps: Math.max(0, ...candidates.map((c) => c.rsvpCount)),
    now,
  };
}

export function scoreEvent(event: RankCandidate, ctx: ScoringContext): ScoredEvent {
  const reasons: string[] = [];
  let score = 0;

  if (ctx.interests.has(event.category)) {
    score += WEIGHTS.interest;
    reasons.push("interest");
  }

  const cat = affinity(ctx.byCategory.get(event.category)) * WEIGHTS.categoryHistory;
  const org = affinity(ctx.byOrg.get(event.orgId)) * WEIGHTS.orgHistory;
  if (cat + org > 0.25) reasons.push("history");
  score += cat + org;

  const hosts = [event.orgId, ...(event.cohostOrgIds ?? [])];
  if (hosts.some((id) => ctx.followed.has(id))) {
    score += WEIGHTS.follows;
    reasons.push("follows");
  }

  if (ctx.maxRsvps > 0 && event.rsvpCount > 0) {
    // Log scale relative to the most popular candidate, so one viral event doesn't dominate.
    score += (WEIGHTS.trending * Math.log1p(event.rsvpCount)) / Math.log1p(ctx.maxRsvps);
    if (event.rsvpCount >= ctx.maxRsvps / 2) reasons.push("trending");
  }

  const days = (event.startsAt.getTime() - ctx.now.getTime()) / DAY_MS;
  if (days >= 0 && days < SOON_DAYS) {
    score += WEIGHTS.soon * (1 - days / SOON_DAYS);
    if (days < 2) reasons.push("soon");
  }

  return { event, score: Math.round(score * 1000) / 1000, reasons };
}

/** Highest score first; ties go to the sooner event, then id, so order is stable. */
export function compareScored(a: ScoredEvent, b: ScoredEvent): number {
  return (
    b.score - a.score ||
    a.event.startsAt.getTime() - b.event.startsAt.getTime() ||
    a.event.id.localeCompare(b.event.id)
  );
}

export function scoreAll(
  candidates: readonly RankCandidate[],
  profile: RankProfile,
  now: Date,
): ScoredEvent[] {
  const ctx = buildContext(profile, candidates, now);
  return candidates.map((c) => scoreEvent(c, ctx)).sort(compareScored);
}

/** No quiz, no swipes, no follows: show the trending feed (F4, TC-04). */
export function isColdStart(profile: RankProfile): boolean {
  return profile.interests.length === 0 && profile.swipes.length === 0 && profile.followedOrgIds.size === 0;
}
