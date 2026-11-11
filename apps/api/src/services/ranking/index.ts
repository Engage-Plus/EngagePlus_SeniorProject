// Feed ranking pipeline (F3_01, architecture.md "Feed pipeline" steps 2–4):
// deterministic score -> Gemini re-rank of the top 50 (cached 15 min per user) -> fallbacks.
// Step 1 (SQL filtering: upcoming, published, not swiped, schedule/category filters) is the caller's job.
import { TtlCache } from "../../lib/ttlCache.js";
import type { JsonModel } from "../gemini.js";
import { applyOrder, fetchAiOrder, RERANK_LIMIT } from "./aiRerank.js";
import { compareScored, isColdStart, scoreAll } from "./score.js";
import type { RankCandidate, RankedFeed, RankProfile } from "./types.js";

export type { RankCandidate, RankedFeed, RankProfile, ScoredEvent } from "./types.js";

export const RERANK_TTL_MS = 15 * 60 * 1000;

export interface RankDeps {
  model: JsonModel | null;
  /** userId -> AI id order. Share one instance across requests. */
  cache: TtlCache<string[]>;
  now?: () => Date;
}

export function createRerankCache(): TtlCache<string[]> {
  return new TtlCache<string[]>(RERANK_TTL_MS);
}

export async function rankFeed(
  userId: string,
  candidates: readonly RankCandidate[],
  profile: RankProfile,
  deps: RankDeps,
): Promise<RankedFeed> {
  const now = deps.now?.() ?? new Date();
  const scored = scoreAll(candidates, profile, now);

  if (isColdStart(profile)) return { events: scored, strategy: "trending" };
  if (!deps.model || scored.length < 2) return { events: scored, strategy: "deterministic" };

  const top = scored.slice(0, RERANK_LIMIT);
  const rest = scored.slice(RERANK_LIMIT);

  let order = deps.cache.get(userId);
  if (!order) {
    const fresh = await fetchAiOrder(deps.model, profile, top, now);
    if (!fresh) return { events: scored, strategy: "deterministic" };
    order = fresh;
    deps.cache.set(userId, order);
  }
  // A cached order may be missing new events or contain swiped ones; applyOrder handles both.
  return { events: [...applyOrder(top, order), ...rest.sort(compareScored)], strategy: "ai" };
}
