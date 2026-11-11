# CLAUDE.md — Engage+

Read this whole file at the start of every session. It is the shared source of truth for every teammate and every Claude Code session working on this repo.

## Project
Engage+ is a mobile-first responsive **website** (not a native app) for Howard students to discover events and orgs by swiping, and for orgs to post events from Instagram captions. Anthology Engage stays the official system; we do not sync with it.

- Requirements: `docs/01-planning/Engage-Plus-RTM.pdf` (R1–R15, F1–F25, US, TC-01…TC-59)
- Backlog (48 items): `docs/04-team/backlog.csv`
- Risks / decisions: `docs/01-planning/risk-register.md`, `docs/01-planning/open-decisions.md`
- Schema: `prisma/schema.prisma` (source copy in `docs/03-architecture/schema.prisma`)
- API contract: `docs/03-architecture/api-spec.md`
- Auth plan: `docs/02-auth/microsoft-login-plan.md`

## Stack (do not add new services without a team decision)
React + TypeScript (Vite) + Tailwind · Express + TypeScript · Prisma + Postgres (Supabase) · Supabase Storage · Gemini · Jest + Playwright · GitHub Actions · Vercel (web) / Render (api). Must run at $0 on free tiers.

```
apps/web         React front end
apps/api         Express API (routes/, services/, jobs/, middleware/, auth/)
apps/extension   Manifest V3 extension
packages/shared  Shared types + zod schemas (the contract between web and api)
prisma/          schema.prisma, migrations, seed.ts
docs/            Planning kit
```

## Commands
```
docker compose up --build        # db + api + web
npx prisma migrate dev           # apply migrations locally
npx prisma db seed               # seed data
npm run lint && npm run typecheck && npm test   # must pass before every PR
npx playwright test              # e2e
```

## Team and ownership
| Initials | Area | Owns |
|---|---|---|
| DM | AI and insights (Gemini) | F3, F5, F14, F16, F25 · TR1, TR6, NFR5 |
| AD | Auth, org accounts, trust | F9, F11, F21, F24 · TR2, TR3, TR5, NFR2, NFR3 · **schema owner** |
| PF | Student discovery front end | F1, F2, F4, F12, F13 · TR4, TR7, NFR1 |
| SM | Org posting and extension | F8, F10, F15, F19, F22 · NFR4 |
| JM | Social, notifications, engagement | F6, F7, F17, F18, F20, F23 |

Only change code in another owner's area if your task requires it, and say so in the PR so they review it.

## Rules for every session (human or Claude)
1. **Start:** `git checkout main && git pull`. Re-read this file and the tracker. Check open PRs (`gh pr list`) so you don't duplicate work.
2. **One task = one branch = one PR.** Branch name = backlog ID + slug, e.g. `F10_01-posting-form`. Never commit to `main`.
3. **Claim before you build.** Set the tracker row to 🟨 with your initials and branch, push that change first (or open a draft PR) so other sessions see it.
4. **Contracts first.** Shared request/response shapes go in `packages/shared` before web or api code uses them.
5. **Schema changes:** only through a PR reviewed by AD. One migration per PR, named `YYYYMMDD_short_name`. Never edit an applied migration.
6. **Tests:** every backlog item ships with its acceptance test named by ID, e.g. `test('TC-13 repeat swipes never double-count')`. Gemini is mocked in CI.
7. **Finish:** update your tracker row (status, PR link) **in the same PR** as the code. Write a short "Handoff" section in the PR description: what's done, what's left, gotchas.
8. **Don't** rewrite other people's tracker rows, reformat unrelated files, or change this file's rules without a team-approved PR.
9. **If blocked**, set ⛔ and write the reason in the Notes column so the next session sees it.

## Code standards
- TypeScript strict everywhere; no `any`; no file over **300 lines** (TR8, enforced by lint).
- Validate all input with zod. Enforce permissions in the API, never only in the UI.
- Store times in UTC; display America/New_York.
- Every page has loading and error states. Works at 375 px.
- No secrets in code or commits. Use `.env` (template: `docs/06-setup-and-deploy/.env.example`).
- Gemini: send no names or emails; force JSON output; always have a non-AI fallback.

## Auth (current state)
Path B: our own multi-tenant Entra app + server check that `tid` equals Howard's tenant. Scopes: `openid profile email User.Read` only. Code: `apps/api/src/auth/` (starter in `docs/02-auth/starter-code/`). Use `DEV_AUTH=true` dev login locally until the live Howard sign-in test passes. Never enable dev login in production.

## Commit messages
`F10_01: add flyer upload to event form` — backlog ID first, imperative, under 72 chars.

---

## PRD Tracker

Status: ⬜ To do · 🟨 In progress · 🟦 In review · ✅ Done · ⛔ Blocked · 💤 Deferred
Priority: Must = steps 1–24 · Could = steps 25–30. Update only your own rows.

### Foundation (steps 1–4)
| Step | ID | Item | Req | Pri | Owner | Tests | Status | Branch / PR | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | TR1 | Project setup: Vite React TS, Express TS, Prisma, Tailwind | — | Must | DM | TC-52 | 🟦 | [#1](https://github.com/Engage-Plus/EngagePlus_SeniorProject/pull/1) | TC-52 + TC-59 pass locally; no CI yet (TR5) |
| 2 | TR2 | Docker + Docker Compose | — | Must | AD | TC-53 | ⬜ | | compose file in docs/06 |
| 3 | F21 | Microsoft OAuth + roles (Howard tenant only) | R11 | Must | AD | TC-15, TC-17 | 🟨 | | Starter code done, 4/4 unit tests pass; live Howard sign-in pending |
| 3 | F9 | Org creation gate + manager invites | R4, R11 | Must | AD | TC-18, TC-19 | ⬜ | | Org email one-time code (D9) |
| 4 | TR3 | Data models (12 Prisma models) | — | Must | AD | TC-54 | ⬜ | | Draft in docs/03 |

### Core features (steps 5–20)
| Step | ID | Feature | Req | Pri | Owner | Backlog | Tests | Status | Branch / PR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | F2 | Swipe discovery feed (RSVP / follow / skip) | R1 R2 R3 R7 | Must | PF | F2_01–F2_05 | TC-03, 07, 12, 13, 37 | ⬜ | | |
| 6 | F8 | Org dashboard + analytics | R3 R4 R9 | Must | SM | F8_01–F8_03 | TC-14, 16, 45 | ⬜ | | |
| 7 | F6 | Follow + per-org mute | R2 | Must | JM | F6_01, F6_02 | TC-08, 10 | ⬜ | | |
| 7 | F7 | Notification service | R2 R9 | Must | JM | F7_01, F7_02 | TC-09, 43 | ⬜ | | Channel decision D2 |
| 8 | F12 | Class schedule upload + conflict filter | R5 | Must | PF | F12_01, F12_02 | TC-23, 24 | ⬜ | | |
| 9 | F13 | Category + interest filters | R5 | Must | PF | F13_01 | TC-25 | ⬜ | | |
| 10 | F14 | AI caption parser (Gemini) | R6 | Must | DM | F14_01 | TC-27 | 🟦 | [#2](https://github.com/Engage-Plus/EngagePlus_SeniorProject/pull/2) | Stacked on #1. Endpoint 401 until F21 wires `requireUser` |
| 11 | F10 | Event posting form + flyer upload | R4 R6 | Must | SM | F10_01–F10_03 | TC-20, 28, 29 | ⬜ | | |
| 12 | F3 | AI recommendation engine | R1 | Must | DM | F3_01 | TC-02 | 🟦 | [#3](https://github.com/Engage-Plus/EngagePlus_SeniorProject/pull/3) | Ranking service done; `GET /events/feed` route needs TR3 |
| 13 | F16 | AI chat assistant | R7 | Should | DM | F16_01–F16_03 | TC-34, 35, 36 | 🟦 | [#5](https://github.com/Engage-Plus/EngagePlus_SeniorProject/pull/5) | Works behind auth; needs F21 + seeded events to use live |
| 14 | F1 | Org discovery quiz | R1 | Must | PF | F1_01, F1_02 | TC-01, 06 | ⬜ | | |
| 15 | F4 | Trending feed | R1 | Must | PF | F4_01 | TC-04 | ⬜ | | |
| 16 | F20 | Calendar export (.ics) | R10 | Should | JM | F20_01–F20_03 | TC-46, 47, 48 | ⬜ | | |
| 17 | F5 | Post-event feedback | R1 R3 | Must | DM | F5_01 | TC-05 | ⬜ | | |
| 18 | F17 | Friend connections + friends' RSVPs | R8 | Should | JM | F17_01, F17_02 | TC-38, 39 | ⬜ | | |
| 18 | F18 | Hide my RSVPs toggle | R8 | Should | JM | F18_01 | TC-40 | ⬜ | | |
| 19 | F15 | Browser extension (Manifest V3) | R6 | Should | SM | F15_01–F15_03 | TC-30, 31, 32 | ⬜ | | Submit to store ≥ 2 weeks before demo |
| 20 | F11 | Follower-velocity flag | R4 | Must | AD | F11_01 | TC-21 | ⬜ | | |

### Quality and launch (steps 21–24)
| Step | ID | Item | Pri | Owner | Tests | Status | Branch / PR | Notes |
|---|---|---|---|---|---|---|---|---|
| 21 | TR4 | Jest + Playwright suites | Must | PF | TC-55 | ⬜ | | |
| 22 | TR5 | CI/CD with GitHub Actions | Must | AD | TC-56 | ⬜ | | |
| 23 | TR6 | Deploy: Vercel, Render, Supabase | Must | DM | TC-57 | 🟦 | [#4](https://github.com/Engage-Plus/EngagePlus_SeniorProject/pull/4) | Config + guide done; real deploy needs accounts (see docs/06 deploy-guide) |
| 24 | TR7 | Polish: responsive, loading, errors | Must | PF | TC-58 | ⬜ | | |

### Could (steps 25–30) — start only after every Must test passes
| Step | ID | Feature | Req | Owner | Backlog | Tests | Status | Branch / PR | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 25 | F24 | Referral flow + verification badge | R14 | AD | F24_01 | TC-41 | ⬜ | | |
| 26 | F19 | Co-hosted events (EventCohost) | R9 | SM | F19_01, F19_02 | TC-42, 44 | ⬜ | | R9 is Should; build with step 26 |
| 27 | F22 | Recurring events (EventRecurrence) | R12 | SM | F22_01 | TC-33 | ⬜ | | |
| 28 | F23 | Weekly digest + semester nudge | R13 | JM | F23_01, F23_02 | TC-11, 26 | ⬜ | | Needs semester dates (D5) |
| 29 | F25 | Student Activities admin view | R15 | DM | F25_01 | TC-22 | ⬜ | | Scope with Student Activities first (D6) |
| 30 | S2 | Expanded friend features | — | — | — | — | 💤 | | Deferred |

### Non-functional and standards (check before final demo)
| ID | Requirement | Owner | Tests | Status |
|---|---|---|---|---|
| NFR1 | Mobile-first responsive, no native apps | PF | TC-49 | ⬜ |
| NFR2 | Howard-only sign-in | AD | TC-17 | 🟨 |
| NFR3 | Privacy (manager-only analytics, anonymized admin, hideable RSVPs) | AD | TC-15, 22, 40 | ⬜ |
| NFR4 | Extension resilience + paste-box fallback | SM | TC-50 | ⬜ |
| NFR5 | $0 on free tiers (+$5 Chrome Web Store) | DM | TC-51 | ⬜ |
| TR8 | TypeScript only, no file > 300 lines | All | TC-59 | ⬜ |

### Deferred (no owner)
S1 Safe commute · S2 Expanded friends · S3 Anthology Engage sync
