import { beforeEach, describe, expect, it } from "vitest";
import { createSeed, MANAGER_ID, STUDENT_ID, CODERS_ORG, SAMPLE_CLASSES } from "@/lib/demo/seed";
import { __setStateForTests, actions, getState } from "@/lib/demo/store";
import {
  conflictingClass,
  friendsGoing,
  orgAnalytics,
  quizMatches,
  recommend,
  rsvpCount,
  trending,
  upcomingEvents,
} from "@/lib/demo/logic";
import { buildIcs } from "@/lib/demo/ics";
import { etToUtc } from "@/lib/demo/time";

// A fixed Wednesday so weekday-based seed data is predictable.
const NOW = etToUtc(2026, 11, 18, 12, 0);

beforeEach(() => {
  window.localStorage.clear();
  __setStateForTests({ ...createSeed(NOW), userId: STUDENT_ID });
});

describe("swipe feed (F2)", () => {
  it("TC-13 repeat swipes never double-count", () => {
    const id = "ev-02";
    const before = rsvpCount(getState(), id);
    actions.swipe(id, "rsvp");
    actions.swipe(id, "rsvp");
    actions.swipe(id, "rsvp");
    expect(rsvpCount(getState(), id)).toBe(before + 1);
    expect(Object.keys(getState().swipes[STUDENT_ID] ?? {})).toEqual([id]);
  });

  it("TC-12 swiping up follows the host org once", () => {
    actions.swipe("ev-02", "follow");
    actions.swipe("ev-11", "follow"); // same org
    expect(getState().follows[STUDENT_ID]).toEqual([CODERS_ORG]);
  });
});

describe("recommendations (F3)", () => {
  it("TC-02 events from followed orgs rank first, with a reason", () => {
    actions.toggleFollow("org-wellness");
    const [first] = recommend(getState(), STUDENT_ID, NOW.getTime());
    expect(first?.event.org_id).toBe("org-wellness");
    expect(first?.reasons[0]).toMatch(/You follow Wellness Collective/);
  });

  it("TC-02 swiped and RSVP'd events leave the feed", () => {
    const ids = () => recommend(getState(), STUDENT_ID, NOW.getTime()).map((r) => r.event.id);
    actions.swipe("ev-03", "skip");
    actions.toggleRsvp("ev-04");
    expect(ids()).not.toContain("ev-03");
    expect(ids()).not.toContain("ev-04");
  });
});

describe("class schedule (F12)", () => {
  it("TC-23 an event during a class is flagged", () => {
    const resume = getState().events.find((e) => e.title === "Resume Review Drop-in")!;
    expect(conflictingClass(resume, SAMPLE_CLASSES)?.name).toBe("ENGL 205 Writing Seminar");
  });

  it("TC-24 conflicting events are left out of the feed", () => {
    const titles = recommend(getState(), STUDENT_ID, NOW.getTime()).map((r) => r.event.title);
    expect(titles).not.toContain("Resume Review Drop-in");
    expect(titles).not.toContain("Lunch & Learn: MCAT Strategy");
    expect(titles).toContain("Fall Hack Night");
  });
});

describe("trending (F4)", () => {
  it("TC-04 ranks this week's events by RSVPs", () => {
    const top = trending(getState(), 3, NOW.getTime());
    expect(top[0]?.title).toBe("Caribbean Night Market");
    const counts = top.map((e) => rsvpCount(getState(), e.id));
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });
});

describe("org quiz (F1)", () => {
  it("TC-01 matches orgs that share the chosen interests", () => {
    const names = quizMatches(getState().orgs, ["tech", "learning"]).map((m) => m.org.name);
    expect(names[0]).toBe("Bison Coders");
  });
});

describe("friends and privacy (F17, F18)", () => {
  it("TC-38 shows friends who RSVP'd", () => {
    expect(friendsGoing(getState(), STUDENT_ID, "ev-05").map((p) => p.name)).toEqual([
      "Aaliyah Brooks",
      "Simone Carter",
    ]);
  });

  it("TC-40 a friend who hides RSVPs is never shown", () => {
    // Devin RSVP'd to ev-05 but hides RSVPs.
    expect(friendsGoing(getState(), STUDENT_ID, "ev-05").map((p) => p.id)).not.toContain("u-devin");
  });
});

describe("calendar export (F20)", () => {
  it("TC-46 builds a valid .ics event in UTC", () => {
    const ev = getState().events[1]!;
    const ics = buildIcs({ ...ev, title: "Hack, Night; Pizza" }, NOW);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("SUMMARY:Hack\\, Night\\; Pizza");
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics.split("\r\n").every((l) => l.length <= 75)).toBe(true);
  });
});

describe("posting and analytics (F8, F10)", () => {
  it("TC-20 only the org's manager can post for it", () => {
    const draft = {
      org_id: CODERS_ORG,
      title: "Test",
      description: "",
      category: "academic" as const,
      location: "iLab",
      starts_at: NOW.toISOString(),
      ends_at: null,
      is_free: true,
    };
    expect(() => actions.createEvent(draft)).toThrow(/managers/);
    actions.signIn(MANAGER_ID);
    const id = actions.createEvent(draft);
    expect(getState().events.find((e) => e.id === id)?.created_by).toBe(MANAGER_ID);
  });

  it("TC-14 dashboard counts include live RSVPs", () => {
    const before = orgAnalytics(getState(), CODERS_ORG).events.find(
      (e) => e.event.id === "ev-02",
    )!.rsvps;
    actions.toggleRsvp("ev-02");
    const after = orgAnalytics(getState(), CODERS_ORG).events.find(
      (e) => e.event.id === "ev-02",
    )!.rsvps;
    expect(after).toBe(before + 1);
  });
});

describe("example data", () => {
  it("every seeded event is upcoming on the day it is seeded", () => {
    const s = getState();
    expect(upcomingEvents(s, NOW.getTime())).toHaveLength(s.events.length);
  });
});
