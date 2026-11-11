// TC-02 with Gemini mocked. Deterministic layer tested directly (risk G3).
import type { Category } from "@engageplus/shared";
import { TtlCache } from "../../lib/ttlCache.js";
import type { JsonModel } from "../gemini.js";
import { buildRerankPrompt } from "./aiRerank.js";
import { createRerankCache, rankFeed, type RankCandidate, type RankProfile } from "./index.js";
import { scoreAll } from "./score.js";

const NOW = new Date("2026-11-11T17:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const CATS: Category[] = ["ACADEMIC", "CULTURAL", "PROFESSIONAL", "SOCIAL", "OTHER"];

const ev = (id: string, category: Category, rsvpCount: number, daysAhead: number, orgId = `org-${id}`) =>
  ({ id, orgId, title: `Event ${id}`, category, rsvpCount, startsAt: new Date(NOW.getTime() + daysAhead * DAY) }) satisfies RankCandidate;

// 15 events: 3 per category, mixed popularity and dates.
const EVENTS: RankCandidate[] = CATS.flatMap((cat, i) => [
  ev(`${cat[0]}1`, cat, 40 - i * 5, 1 + i),
  ev(`${cat[0]}2`, cat, 10 + i, 5),
  ev(`${cat[0]}3`, cat, 2, 12 - i),
]);

const profile = (p: Partial<RankProfile> = {}): RankProfile => ({
  interests: [],
  involvement: null,
  followedOrgIds: new Set(),
  swipes: [],
  ...p,
});

const top5 = (p: RankProfile) => scoreAll(EVENTS, p, NOW).slice(0, 5).map((s) => s.event);

beforeEach(() => jest.spyOn(console, "warn").mockImplementation(() => undefined));
afterEach(() => jest.restoreAllMocks());

test("TC-02 two users with different answers get different top-5 events", () => {
  const a = top5(profile({ interests: ["ACADEMIC", "PROFESSIONAL"], involvement: "leadership" }));
  const b = top5(profile({ interests: ["SOCIAL", "CULTURAL"], involvement: "casual" }));

  expect(a.map((e) => e.id)).not.toEqual(b.map((e) => e.id));
  expect(a.every((e) => ["ACADEMIC", "PROFESSIONAL"].includes(e.category))).toBe(true);
  expect(b.every((e) => ["SOCIAL", "CULTURAL"].includes(e.category))).toBe(true);
});

test("TC-02 swipe history reorders events after quiz answers", () => {
  const swipes = [
    ...Array.from({ length: 6 }, () => ({ category: "SOCIAL" as const, orgId: "elsewhere", action: "RIGHT" as const })),
    ...Array.from({ length: 6 }, () => ({ category: "PROFESSIONAL" as const, orgId: "elsewhere", action: "LEFT" as const })),
  ];
  const plain = scoreAll(EVENTS, profile({ interests: ["ACADEMIC"] }), NOW);
  const withHistory = scoreAll(EVENTS, profile({ interests: ["ACADEMIC"], swipes }), NOW);
  const rank = (list: typeof plain, id: string) => list.findIndex((s) => s.event.id === id);

  expect(withHistory[0]?.event.category).toBe("ACADEMIC"); // quiz still leads
  expect(rank(withHistory, "S2")).toBeLessThan(rank(plain, "S2"));
  expect(rank(withHistory, "P2")).toBeGreaterThan(rank(plain, "P2"));
  expect(rank(withHistory, "S2")).toBeLessThan(rank(withHistory, "P2"));
});

test("TC-02 followed orgs (including co-hosts) are boosted", () => {
  const events = [ev("x", "OTHER", 5, 3, "org-x"), { ...ev("y", "OTHER", 5, 3, "org-y"), cohostOrgIds: ["org-z"] }];
  const ranked = scoreAll(events, profile({ followedOrgIds: new Set(["org-z"]) }), NOW);
  expect(ranked[0]?.event.id).toBe("y");
  expect(ranked[0]?.reasons).toContain("follows");
});

test("TC-02 ranking is deterministic", () => {
  const p = profile({ interests: ["CULTURAL"] });
  expect(scoreAll(EVENTS, p, NOW)).toEqual(scoreAll([...EVENTS].reverse(), p, NOW));
});

test("TC-02 cold start returns the trending order without calling AI", async () => {
  const generateJson = jest.fn();
  const res = await rankFeed("u1", EVENTS, profile(), {
    model: { generateJson },
    cache: createRerankCache(),
    now: () => NOW,
  });
  expect(res.strategy).toBe("trending");
  expect(res.events[0]?.event.id).toBe("A1"); // most RSVPs
  expect(generateJson).not.toHaveBeenCalled();
});

test("TC-02 AI re-rank keeps only known ids and appends the ones it skipped", async () => {
  const p = profile({ interests: ["SOCIAL"] });
  const deterministic = scoreAll(EVENTS, p, NOW).map((s) => s.event.id);
  const model: JsonModel = {
    generateJson: async () => ({ orderedIds: ["O3", "made-up-id", "C2", "O3"] }),
  };
  const res = await rankFeed("u1", EVENTS, p, { model, cache: createRerankCache(), now: () => NOW });
  const ids = res.events.map((s) => s.event.id);

  expect(res.strategy).toBe("ai");
  expect(ids.slice(0, 2)).toEqual(["O3", "C2"]);
  expect(ids).not.toContain("made-up-id");
  expect(ids).toHaveLength(EVENTS.length);
  expect(ids.slice(2)).toEqual(deterministic.filter((id) => id !== "O3" && id !== "C2"));
});

test.each([
  ["throws", async () => Promise.reject(new Error("quota"))],
  ["returns junk", async () => ({ ids: 5 })],
])("TC-02 falls back to the deterministic order when AI %s", async (_label, generateJson) => {
  const p = profile({ interests: ["SOCIAL"] });
  const res = await rankFeed("u1", EVENTS, p, { model: { generateJson }, cache: createRerankCache(), now: () => NOW });
  expect(res.strategy).toBe("deterministic");
  expect(res.events.map((s) => s.event.id)).toEqual(scoreAll(EVENTS, p, NOW).map((s) => s.event.id));
});

test("TC-02 AI order is cached per user for 15 minutes", async () => {
  let clock = 0;
  const cache = new TtlCache<string[]>(15 * 60 * 1000, 100, () => clock);
  const generateJson = jest.fn(async () => ({ orderedIds: ["O1"] }));
  const deps = { model: { generateJson }, cache, now: () => NOW };
  const p = profile({ interests: ["SOCIAL"] });

  await rankFeed("u1", EVENTS, p, deps);
  const cached = await rankFeed("u1", EVENTS.filter((e) => e.id !== "O1"), p, deps); // O1 swiped away
  expect(generateJson).toHaveBeenCalledTimes(1);
  expect(cached.events.map((s) => s.event.id)).not.toContain("O1");

  await rankFeed("u2", EVENTS, p, deps);
  expect(generateJson).toHaveBeenCalledTimes(2); // other user, own entry

  clock += 15 * 60 * 1000;
  await rankFeed("u1", EVENTS, p, deps);
  expect(generateJson).toHaveBeenCalledTimes(3); // expired
});

test("TC-02 re-rank prompt sends interests and event ids only", () => {
  const p = profile({
    interests: ["SOCIAL"],
    swipes: [{ category: "SOCIAL", orgId: "o", action: "RIGHT" }],
  });
  const prompt = buildRerankPrompt(p, scoreAll(EVENTS, p, NOW).slice(0, 3), NOW);
  expect(prompt).toContain('"interests":["SOCIAL"]');
  expect(prompt).toContain('"SOCIAL":"+1/-0"');
  expect(prompt).toMatch(/"id":"S1"/);
  expect(prompt).not.toMatch(/userId|email|name/i);
});

test("TC-02 TTL cache evicts the oldest entry when full", () => {
  const cache = new TtlCache<number>(1000, 2, () => 0);
  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);
  expect(cache.get("a")).toBeUndefined();
  expect(cache.get("b")).toBe(2);
  expect(cache.get("c")).toBe(3);
});
