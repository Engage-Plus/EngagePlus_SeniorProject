import type { ClassBlock, DemoState, EventItem, Org, Person } from "./types";
import { etParts } from "./time";

const PAST_GRACE_MS = 6 * 3600e3;

export type EventWithOrg = EventItem & { organizations: { id: string; name: string } | null };

export function withOrg(s: DemoState, e: EventItem): EventWithOrg {
  const o = s.orgs.find((x) => x.id === e.org_id);
  return { ...e, organizations: o ? { id: o.id, name: o.name } : null };
}

export function upcomingEvents(s: DemoState, now = Date.now()): EventWithOrg[] {
  return s.events
    .filter((e) => new Date(e.starts_at).getTime() > now - PAST_GRACE_MS)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .map((e) => withOrg(s, e));
}

export function currentUser(s: DemoState): Person | null {
  return s.people.find((p) => p.id === s.userId) ?? null;
}

export function rsvpCount(s: DemoState, eventId: string): number {
  const e = s.events.find((x) => x.id === eventId);
  const live = Object.values(s.rsvps).filter((list) => list.includes(eventId)).length;
  return (e?.baseRsvps ?? 0) + live;
}

export function followerCount(s: DemoState, orgId: string): number {
  const o = s.orgs.find((x) => x.id === orgId);
  const live = Object.values(s.follows).filter((list) => list.includes(orgId)).length;
  return (o?.baseFollowers ?? 0) + live;
}

/** Friends going to an event, skipping anyone who hid their RSVPs (F17, F18). */
export function friendsGoing(s: DemoState, userId: string | null, eventId: string): Person[] {
  if (!userId) return [];
  return (s.friends[userId] ?? [])
    .filter((fid) => !s.hideRsvps[fid] && (s.rsvps[fid] ?? []).includes(eventId))
    .map((fid) => s.people.find((p) => p.id === fid))
    .filter((p): p is Person => !!p);
}

export function filterEvents<T extends { title: string; description: string; category: string }>(
  events: T[],
  search: string,
  category: string | null,
) {
  const q = search.trim().toLowerCase();
  return events.filter(
    (e) =>
      (!category || e.category === category) &&
      (!q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
  );
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** The class an event overlaps, using New York weekday and time (F12). */
export function conflictingClass(
  e: Pick<EventItem, "starts_at" | "ends_at">,
  classes: ClassBlock[],
): ClassBlock | null {
  const start = etParts(new Date(e.starts_at));
  const endDate = new Date(e.ends_at ?? new Date(e.starts_at).getTime() + 3600e3);
  const end = etParts(endDate);
  const s = start.hour * 60 + start.minute;
  const en = end.day === start.day ? end.hour * 60 + end.minute : 24 * 60;
  return (
    classes.find(
      (c) => c.days.includes(start.weekday) && s < toMinutes(c.end) && toMinutes(c.start) < en,
    ) ?? null
  );
}

/** Trending: most RSVPs among events in the next 7 days (F4). */
export function trending(s: DemoState, limit = 3, now = Date.now()): EventWithOrg[] {
  const week = now + 7 * 24 * 3600e3;
  return upcomingEvents(s, now)
    .filter((e) => new Date(e.starts_at).getTime() <= week)
    .sort((a, b) => rsvpCount(s, b.id) - rsvpCount(s, a.id))
    .slice(0, limit);
}

export interface Recommendation {
  event: EventWithOrg;
  score: number;
  reasons: string[];
}

/**
 * Deterministic "For you" score (F3). Production adds a Gemini re-rank on the API;
 * this score is also its non-AI fallback.
 */
export function recommend(s: DemoState, userId: string, now = Date.now()): Recommendation[] {
  const follows = s.follows[userId] ?? [];
  const interests = s.interests[userId] ?? [];
  const classes = s.classes[userId] ?? [];
  const swiped = s.swipes[userId] ?? {};
  const hot = new Set(trending(s, 3, now).map((e) => e.id));
  return upcomingEvents(s, now)
    .filter(
      (e) =>
        !swiped[e.id] && !(s.rsvps[userId] ?? []).includes(e.id) && !conflictingClass(e, classes),
    )
    .map((event) => {
      const reasons: string[] = [];
      let score = 0;
      if (follows.includes(event.org_id)) {
        score += 6;
        reasons.push(`You follow ${event.organizations?.name}`);
      }
      const matched = event.tags.filter((t) => interests.includes(t));
      if (matched.length) {
        score += 2 * matched.length;
        reasons.push(`Matches your interests: ${matched.join(", ")}`);
      }
      const friends = friendsGoing(s, userId, event.id);
      if (friends.length) {
        score += 2 * friends.length;
        reasons.push(`${friends.map((f) => f.name.split(" ")[0]).join(" & ")} going`);
      }
      if (hot.has(event.id)) {
        score += 1;
        reasons.push("Trending this week");
      }
      if (!reasons.length) reasons.push("Fits your free time");
      return { event, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.event.starts_at.localeCompare(b.event.starts_at));
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { label: string; tags: string[] }[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "goal",
    prompt: "What do you want most out of this semester?",
    options: [
      { label: "Land an internship", tags: ["career", "money"] },
      { label: "Build skills", tags: ["learning", "tech"] },
      { label: "Find my community", tags: ["culture", "service"] },
      { label: "Have fun and unwind", tags: ["fun", "games"] },
    ],
  },
  {
    id: "vibe",
    prompt: "Pick a Friday night.",
    options: [
      { label: "Open mic or art show", tags: ["arts", "chill"] },
      { label: "Dance party or concert", tags: ["music", "fun"] },
      { label: "Hackathon with pizza", tags: ["tech"] },
      { label: "Yoga and early night", tags: ["wellness", "chill"] },
    ],
  },
  {
    id: "field",
    prompt: "Which field are you closest to?",
    options: [
      { label: "STEM", tags: ["tech", "learning"] },
      { label: "Health & medicine", tags: ["health"] },
      { label: "Business & law", tags: ["career", "leadership"] },
      { label: "Arts & humanities", tags: ["arts", "culture"] },
    ],
  },
];

/** Ranks orgs by overlap with the quiz answers' tags (F1). */
export function quizMatches(orgs: Org[], tags: string[], limit = 3): { org: Org; score: number }[] {
  return orgs
    .map((org) => ({ org, score: org.tags.filter((t) => tags.includes(t)).length }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || b.org.baseFollowers - a.org.baseFollowers)
    .slice(0, limit);
}

export interface EventStats {
  event: EventItem;
  views: number;
  swipeRights: number;
  rsvps: number;
  conversion: number;
}

/** Manager-only analytics for one org (F8). Callers must check the viewer manages the org. */
export function orgAnalytics(
  s: DemoState,
  orgId: string,
): { followers: number; events: EventStats[] } {
  const events = s.events
    .filter((e) => e.org_id === orgId)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .map((event) => {
      const views = event.baseViews + (s.views[event.id] ?? 0);
      const swipeRights =
        Math.round(event.baseRsvps * 1.3) +
        Object.values(s.swipes).filter((sw) => sw[event.id] === "rsvp" || sw[event.id] === "follow")
          .length;
      const rsvps = rsvpCount(s, event.id);
      return { event, views, swipeRights, rsvps, conversion: views ? rsvps / views : 0 };
    });
  return { followers: followerCount(s, orgId), events };
}

export function canManage(user: Person | null, org: Pick<Org, "id" | "owner_id">): boolean {
  return !!user && (org.owner_id === user.id || user.orgIds.includes(org.id));
}
