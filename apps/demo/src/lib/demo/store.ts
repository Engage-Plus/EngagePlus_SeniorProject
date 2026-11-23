import { useSyncExternalStore } from "react";
import type { ClassBlock, DemoState, EventDraft, Org, SwipeAction } from "./types";
import { EMPTY_STATE, SEED_VERSION, createSeed } from "./seed";
import { etDayKey } from "./time";

// The demo keeps all data in this browser (localStorage) so it runs on GitHub Pages
// with no backend. Data reseeds each day so event dates always sit in the next two weeks.
const KEY = "engageplus-demo";

let state: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as DemoState;
      if (saved.version === SEED_VERSION && saved.seededOn === etDayKey(new Date()))
        return { ...saved, ready: true };
    }
  } catch {
    // Corrupt or blocked storage: fall through to fresh example data.
  }
  return createSeed();
}

export function getState(): DemoState {
  if (typeof window === "undefined") return EMPTY_STATE;
  if (!state) state = load();
  return state;
}

function setState(update: (s: DemoState) => DemoState) {
  state = update(getState());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the demo still works for this tab.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Server render and first hydration see EMPTY_STATE (ready=false), so pages show their loading state. */
export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, getState, () => EMPTY_STATE);
}

/** For tests: replace the whole state. */
export function __setStateForTests(s: DemoState) {
  state = s;
  listeners.forEach((l) => l());
}

const toggle = (list: string[] = [], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
const add = (list: string[] = [], id: string) => (list.includes(id) ? list : [...list, id]);
const requireUser = (s: DemoState) => {
  if (!s.userId) throw new Error("Sign in first");
  return s.userId;
};

export const actions = {
  signIn(userId: string) {
    setState((s) => ({ ...s, userId }));
  },
  signOut() {
    setState((s) => ({ ...s, userId: null }));
  },
  resetDemo() {
    setState((s) => ({ ...createSeed(), userId: s.userId }));
  },
  toggleRsvp(eventId: string) {
    setState((s) => {
      const u = requireUser(s);
      return { ...s, rsvps: { ...s.rsvps, [u]: toggle(s.rsvps[u], eventId) } };
    });
  },
  toggleFollow(orgId: string) {
    setState((s) => {
      const u = requireUser(s);
      return { ...s, follows: { ...s.follows, [u]: toggle(s.follows[u], orgId) } };
    });
  },
  /**
   * One swipe per user per event: a repeat swipe replaces the old one, and RSVP/follow
   * use set semantics, so counts never double (TC-13).
   */
  swipe(eventId: string, action: SwipeAction) {
    setState((s) => {
      const u = requireUser(s);
      const ev = s.events.find((e) => e.id === eventId);
      const next = { ...s, swipes: { ...s.swipes, [u]: { ...s.swipes[u], [eventId]: action } } };
      if (action === "rsvp") next.rsvps = { ...s.rsvps, [u]: add(s.rsvps[u], eventId) };
      if (action === "follow" && ev)
        next.follows = { ...s.follows, [u]: add(s.follows[u], ev.org_id) };
      return next;
    });
  },
  clearSwipes() {
    setState((s) => {
      const u = requireUser(s);
      return { ...s, swipes: { ...s.swipes, [u]: {} } };
    });
  },
  recordView(eventId: string) {
    setState((s) => ({ ...s, views: { ...s.views, [eventId]: (s.views[eventId] ?? 0) + 1 } }));
  },
  setClasses(classes: ClassBlock[]) {
    setState((s) => ({ ...s, classes: { ...s.classes, [requireUser(s)]: classes } }));
  },
  setInterests(tags: string[]) {
    setState((s) => ({ ...s, interests: { ...s.interests, [requireUser(s)]: tags } }));
  },
  setHideRsvps(hide: boolean) {
    setState((s) => ({ ...s, hideRsvps: { ...s.hideRsvps, [requireUser(s)]: hide } }));
  },
  /** Only an org's manager may post for it; enforced here as the API would. */
  createEvent(draft: EventDraft): string {
    const s = getState();
    const u = requireUser(s);
    const org = s.orgs.find((o) => o.id === draft.org_id);
    if (!org || org.owner_id !== u)
      throw new Error("Only this org's managers can post events for it.");
    const id = `ev-new-${Date.now().toString(36)}`;
    const tags = [...new Set([draft.category, ...org.tags.slice(0, 2)])];
    setState((st) => ({
      ...st,
      events: [...st.events, { ...draft, id, tags, created_by: u, baseRsvps: 0, baseViews: 0 }],
    }));
    return id;
  },
  createOrg(input: Pick<Org, "name" | "description" | "category">): string {
    const s = getState();
    const u = requireUser(s);
    const id = `org-new-${Date.now().toString(36)}`;
    const handle = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20);
    setState((st) => ({
      ...st,
      orgs: [
        ...st.orgs,
        {
          ...input,
          id,
          handle,
          verified: false,
          baseFollowers: 0,
          tags: [input.category],
          owner_id: u,
        },
      ],
      people: st.people.map((p) =>
        p.id === u ? { ...p, role: "org_manager", orgIds: [...p.orgIds, id] } : p,
      ),
    }));
    return id;
  },
};
