// Chat test events. "Now" is Wed Nov 11 2026, 12:00 noon in New York (EST, UTC-5).
import type { Category } from "@engageplus/shared";
import { nyLocalToUtc } from "../../lib/time.js";
import type { CandidateSource, ChatCandidate } from "./types.js";

export const NOW = new Date("2026-11-11T17:00:00Z");

function ev(id: string, title: string, category: Category, date: string, time: string, hours = 1): ChatCandidate {
  const startsAt = nyLocalToUtc(date, time);
  return {
    id,
    title,
    description: null,
    category,
    location: "Blackburn Center",
    orgName: `Org ${id}`,
    startsAt,
    endsAt: new Date(startsAt.getTime() + hours * 3600_000),
  };
}

export const EVENTS: ChatCandidate[] = [
  ev("past", "Morning yoga", "SOCIAL", "2026-11-11", "10:00"), // already over
  ev("lunch", "Career lunch", "PROFESSIONAL", "2026-11-11", "11:30", 1.5), // in progress
  ev("resume", "Resume workshop", "PROFESSIONAL", "2026-11-11", "13:00"),
  ev("openmic", "Open mic poetry", "CULTURAL", "2026-11-11", "16:30"),
  ev("games", "Game night", "SOCIAL", "2026-11-11", "18:00", 3),
  ev("study", "Study jam", "ACADEMIC", "2026-11-12", "14:00"),
  ev("party", "Homecoming party", "SOCIAL", "2026-11-14", "20:00", 4),
  ev("fair", "Career fair", "PROFESSIONAL", "2026-11-20", "18:00"),
];

/** Deliberately sloppy: ignores the range, so tests prove the service filters in code. */
export const everything: CandidateSource = async () => EVENTS;
