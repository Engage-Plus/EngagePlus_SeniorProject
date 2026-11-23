export const CATEGORIES = ["academic", "cultural", "professional", "social"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Role = "student" | "org_manager";
export type SwipeAction = "rsvp" | "follow" | "skip";

export interface Org {
  id: string;
  name: string;
  description: string;
  category: Category;
  handle: string;
  verified: boolean;
  /** Followers who joined before the demo started (real follows are added on top). */
  baseFollowers: number;
  tags: string[];
  owner_id: string | null;
}

export interface EventItem {
  id: string;
  org_id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  starts_at: string;
  ends_at: string | null;
  is_free: boolean;
  tags: string[];
  created_by: string | null;
  /** RSVPs and views from before the demo started, so counts look like a live campus. */
  baseRsvps: number;
  baseViews: number;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgIds: string[];
}

export interface ClassBlock {
  id: string;
  name: string;
  /** 0 = Sunday … 6 = Saturday, in America/New_York. */
  days: number[];
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface DemoState {
  ready: boolean;
  version: number;
  seededOn: string;
  userId: string | null;
  people: Person[];
  orgs: Org[];
  events: EventItem[];
  rsvps: Record<string, string[]>;
  follows: Record<string, string[]>;
  swipes: Record<string, Record<string, SwipeAction>>;
  views: Record<string, number>;
  classes: Record<string, ClassBlock[]>;
  interests: Record<string, string[]>;
  friends: Record<string, string[]>;
  hideRsvps: Record<string, boolean>;
}

export interface EventDraft {
  org_id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  starts_at: string;
  ends_at: string | null;
  is_free: boolean;
}
