import type { DemoState, EventItem, Org, Person } from "./types";
import { daysUntilWeekday, etDate, etDayKey } from "./time";
import {
  CODERS_ORG,
  EVENT_ROWS,
  FRIEND_RSVPS,
  MANAGER_ID,
  NEXT_MON,
  NEXT_TUE,
  ORG_ROWS,
  PEOPLE_ROWS,
  SAMPLE_CLASSES,
  STUDENT_ID,
} from "./seed-data";

export { CODERS_ORG, MANAGER_ID, SAMPLE_CLASSES, STUDENT_ID } from "./seed-data";

/** Bump when the shape or content of the example data changes, so browsers reseed. */
export const SEED_VERSION = 3;

export const PEOPLE: Person[] = PEOPLE_ROWS.map(([id, name, email, role]) => ({
  id,
  name,
  email,
  role,
  orgIds: id === MANAGER_ID ? [CODERS_ORG] : [],
}));

export const ORGS: Org[] = ORG_ROWS.map(
  ([id, name, category, handle, baseFollowers, verified, tags, description]) => ({
    id,
    name,
    category,
    handle,
    baseFollowers,
    verified,
    tags,
    description,
    owner_id: id === CODERS_ORG ? MANAGER_ID : null,
  }),
);

function resolveDay(now: Date, day: number): number {
  if (day === NEXT_MON) return daysUntilWeekday(now, 1);
  if (day === NEXT_TUE) return daysUntilWeekday(now, 2);
  return day;
}

export function buildEvents(now: Date): EventItem[] {
  return EVENT_ROWS.map((row, i) => {
    const [
      org_id,
      title,
      category,
      location,
      day,
      hour,
      minute,
      hours,
      is_free,
      tags,
      baseRsvps,
      description,
    ] = row;
    const start = etDate(now, resolveDay(now, day), hour, minute);
    return {
      id: `ev-${String(i + 1).padStart(2, "0")}`,
      org_id,
      title,
      category,
      location,
      is_free,
      tags,
      description,
      baseRsvps,
      baseViews: baseRsvps * 4 + 25,
      starts_at: start.toISOString(),
      ends_at: new Date(start.getTime() + hours * 3600e3).toISOString(),
      created_by: null,
    };
  });
}

export function createSeed(now = new Date()): DemoState {
  return {
    ready: true,
    version: SEED_VERSION,
    seededOn: etDayKey(now),
    userId: null,
    people: PEOPLE,
    orgs: ORGS,
    events: buildEvents(now),
    rsvps: { ...FRIEND_RSVPS },
    follows: { "u-aaliyah": ["org-caribbean"], "u-marcus": [CODERS_ORG] },
    swipes: {},
    views: {},
    classes: { [STUDENT_ID]: SAMPLE_CLASSES },
    interests: {},
    friends: { [STUDENT_ID]: ["u-aaliyah", "u-marcus", "u-simone", "u-devin"] },
    // Devin hides their RSVPs (F18), so friends never see them.
    hideRsvps: { "u-devin": true },
  };
}

export const EMPTY_STATE: DemoState = {
  ready: false,
  version: SEED_VERSION,
  seededOn: "",
  userId: null,
  people: [],
  orgs: [],
  events: [],
  rsvps: {},
  follows: {},
  swipes: {},
  views: {},
  classes: {},
  interests: {},
  friends: {},
  hideRsvps: {},
};
