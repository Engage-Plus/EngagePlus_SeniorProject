# Demo runbook: setup, recording, recovery

Use with [demo-script.md](demo-script.md).

## The demo app

- **Live:** https://engage-plus.github.io/EngagePlus_SeniorProject/ (deploys from `main` via `.github/workflows/demo-pages.yml`)
- **Local:** `cd apps/demo && npm ci && npm run dev`, then open http://localhost:5173 (or the port Vite prints)
- **No backend.** All data is example data saved in the browser (`localStorage`, key `engageplus-demo`). Nothing can go stale, pause, or need a password.
- **Dates are always fresh.** The data reseeds on the first visit each day (New York time), so events always fall within the next two weeks.
- **Reset between takes:** Sign in page → **Reset demo data**. This clears RSVPs, swipes, follows, quiz answers and posted events.

### Demo accounts (fictional)

| Account | Role | Starts with |
|---|---|---|
| Jordan Ellis | Student | 3 classes on the schedule, 4 friends (one hides RSVPs), follows nobody, no quiz answers |
| Taylor Reed | Org manager, Bison Coders | Dashboard with 3 upcoming events |

### Example data

10 orgs, 18 events over the next 14 days across all four categories, plus friends' RSVPs. Two events (Resume Review, MCAT Lunch & Learn) are always placed to overlap Jordan's classes, so the conflict filter has something to hide. Edit the data in `apps/demo/src/lib/demo/seed-data.ts`, and bump `SEED_VERSION` in `seed.ts` so browsers reseed.

## The day before

- [ ] Open the live URL and confirm Discover shows **Trending this week** and a full list.
- [ ] Do one full rehearsal using the script, timing each segment.
- [ ] Prepare 3 slides: title, stack/tests/roadmap, team.
- [ ] Record a clean backup take of segments 3 and 6 (the live-heavy parts).

## Browser setup

1. Create a fresh Chrome profile (no bookmarks bar, no extensions, notifications off).
2. Open the live URL, then **Sign in → Reset demo data**, then sign out (top right).
3. Phone segments (1–5): DevTools (F12) → device toolbar (Ctrl+Shift+M) → **iPhone 12 Pro** or a 375×812 custom size, zoom 100%. Hide the DevTools panel so only the phone frame shows.
4. Org segment (6): turn the device toolbar off for a desktop view and zoom to 110–125%.
5. Close other tabs and turn on Windows Focus Assist / Do Not Disturb.

## Recording (OBS Studio, free)

- Canvas and output 1920×1080, 30 fps, MP4 (or MKV, then remux to MP4)
- Sources: Window Capture (the Chrome window) and an audio input (your mic). Mute desktop audio.
- Turn on the cursor in the capture, and slow down: pause a beat after every tap.
- Record each script segment as its own clip, then join them in Clipchamp (built into Windows 11) or DaVinci Resolve.
- Optional: add simple captions in Clipchamp for the F-ID callouts.

## If something goes wrong

| Problem | Fix |
|---|---|
| Swipe feed says "You're all caught up" | Tap **Start over**, or Reset demo data |
| A previous take's RSVPs or posted event show up | Sign in page → **Reset demo data** |
| Caption didn't fill a field | Type it in; the status line says which field it missed. Example 1 always fills all four. |
| Live site down or a deploy in progress | Run locally: `cd apps/demo && npm run dev` |
| Live presentation fails | Play the backup clips |

## Tests

```
cd apps/demo
npm test          # 22 tests, named by TC ID (TC-01, 02, 04, 12, 13, 14, 20, 23, 24, 27, 28, 38, 40, 46)
```
