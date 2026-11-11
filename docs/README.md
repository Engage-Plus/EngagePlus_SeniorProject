# Engage+ Project Kit (docs/)

Planning kit for Engage+. The repo root `CLAUDE.md` holds the team rules and the PRD tracker — read it first.
Start with `01-planning/risk-register.md` and `02-auth/microsoft-login-plan.md`.

| Folder | What's inside | Who reads it first |
|---|---|---|
| `01-planning/` | Risk register (what can go wrong), open decisions log, milestone plan | Everyone |
| `02-auth/` | Microsoft login fix (5 steps), tested TypeScript starter code, test results log, Howard IT email with one-click admin consent | AD (auth owner) |
| `03-architecture/` | System architecture, Prisma schema (12 models), API spec | DM, AD |
| `04-team/` | Sprint plan, team workflow + Definition of Done, backlog CSV (48 items, importable to GitHub Projects) | Everyone |
| `05-testing/` | Test plan mapping TC-01…TC-59 to suites | PF (TR4 owner) |
| `06-setup-and-deploy/` | Local setup, docker-compose, `.env.example`, deployment checklist | DM, AD |
| `07-extension/` | Browser extension plan + starter `manifest.json` | SM |

## Team key
DM – AI and insights · AD – Auth, org accounts, trust · PF – Student discovery front end · SM – Org posting and extension · JM – Social, notifications, engagement

## Order of work (critical path)
1. TR1–TR3: repo, Docker, Prisma schema (week 1)
2. **Auth (week 1)** — Path B chosen. Do Steps 1–4 in `02-auth/microsoft-login-plan.md`, copy `02-auth/starter-code/src/auth/` into `apps/api/src/auth/`; use dev login until the live test passes
3. Core loop: events → swipe feed → RSVP → org dashboard (R1–R4, Must)
4. AI: caption parser, then recommendations, then chat (R6, R1, R7)
5. Should/Could features (R8–R15), then extension (F15) last
