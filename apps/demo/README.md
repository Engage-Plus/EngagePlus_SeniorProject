# Engage+ demo

A clickable prototype of Engage+ for demos and user testing. It was first built with
[Lovable](https://lovable.dev) and now runs entirely in the browser on example data.

**Live:** https://engage-plus.github.io/EngagePlus_SeniorProject/ ·
**Script and recording guide:** [docs/08-demo](../../docs/08-demo/)

This is not the production app. That lives in `apps/web` + `apps/api` (see the root `CLAUDE.md`).

## What it shows

| Feature | Where | Req |
|---|---|---|
| Swipe feed: right = RSVP, up = follow, left = skip | `/swipe` | F2 |
| "For you" ranking with reasons | `/swipe` | F3 |
| Trending this week, category filters, search | `/` | F4, F13 |
| Org quiz | `/quiz` | F1 |
| Class schedule and conflict filter | `/my-events`, `/` | F12 |
| Friends going and "hide my RSVPs" | cards, `/my-events` | F17, F18 |
| Add to calendar (.ics) | event page | F20 |
| Post from an Instagram caption (rule-based parser) | `/create` | F10, F14 |
| Manager-only dashboard | `/dashboard` | F8 |

## How the data works

- No backend. `src/lib/demo/store.ts` keeps state in `localStorage` (`engageplus-demo`).
- `src/lib/demo/seed-data.ts` holds the example orgs, events, people (all fictional) and class schedule. Event days are offsets from today in New York time, and the data reseeds each day so dates never go stale.
- Sign in with one click as a student or an org manager. **Reset demo data** is on the sign-in page.
- Feature logic is plain functions in `src/lib/demo/` (`logic.ts`, `caption.ts`, `ics.ts`) with tests in `src/test/`.

The Supabase client and migration from the Lovable version are still in the repo but no page uses them.

## Development

```sh
npm ci
npm run dev        # local dev server
npm test           # vitest, tests named by TC ID
```

GitHub Pages build (as CI runs it):

```sh
PAGES_BASE=/EngagePlus_SeniorProject/ npm run build
# Windows Git Bash: prefix with MSYS_NO_PATHCONV=1 or the base path gets rewritten
```
