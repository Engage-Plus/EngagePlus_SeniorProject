# Test Plan (TR4)

| Layer | Tool | Covers | Runs |
|---|---|---|---|
| Unit | Jest | Ranking score, schedule-conflict logic, .ics builder, rrule expansion, `tid` check, dedupe of notifications | Every PR |
| API integration | Jest + Supertest + test Postgres (Docker) | Permissions (TC-15, 18, 44), RSVP counts (TC-12–14), privacy (TC-22, 40) | Every PR |
| End-to-end | Playwright (375 px + desktop) | Quiz → feed → swipe → RSVP; org post flow; calendar export | Every PR (smoke), nightly (full) |
| AI | Jest with recorded Gemini fixtures | TC-27, TC-34–36 — real API only in a nightly job | Nightly |
| Manual | Checklist | TC-48 calendar imports, TC-31 extension install screen, TC-49 Safari | Before each demo |

## Rules
- Each test is named with its ID: `test('TC-13 repeat swipes never double-count', ...)`.
- Auth in tests uses the dev-login stub; one Playwright test covers the real Microsoft redirect (TC-17) against a test account.
- Gemini is mocked by default so CI is free and deterministic.
- Seed file `prisma/seed.ts` creates: 3 orgs, 20 events across categories, 5 students, 1 admin, friendships, one co-hosted event.

## Test → requirement quick map
TC-01–06 R1 · TC-07–10 R2 · TC-11 R13 · TC-12–14, 16 R3 · TC-15, 17 R11 · TC-18–21 R4 · TC-22 R15 · TC-23–25 R5 · TC-26 R13 · TC-27–32 R6 · TC-33 R12 · TC-34–37 R7 · TC-38–40 R8 · TC-41 R14 · TC-42–45 R9 · TC-46–48 R10 · TC-49–59 NFR/TR
