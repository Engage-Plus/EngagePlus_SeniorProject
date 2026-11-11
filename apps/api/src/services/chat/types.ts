// Chat assistant inputs (F16). Candidates come from the DB; tests inject fakes.
import type { Category } from "@engageplus/shared";

export interface ChatCandidate {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  location: string | null;
  orgName: string;
  startsAt: Date;
  endsAt: Date;
}

/** Loads published events overlapping [from, to), soonest first. */
export type CandidateSource = (range: { from: Date; to: Date }) => Promise<ChatCandidate[]>;

export interface Pick {
  event: ChatCandidate;
  reason: string;
}
