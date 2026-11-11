# Risk Register — Engage+

Likelihood (L) and Impact (I): High / Med / Low. Review at every sprint planning.

## 1. Authentication (highest risk)

| # | Risk | L | I | Mitigation | Owner | Status (Nov 11) |
|---|---|---|---|---|---|---|
| A1 | **Howard IT won't register the app in Howard's tenant**, and students usually can't register apps there themselves. | High | High | Register a multi-tenant app in your *own* Entra directory and only accept tokens whose `tid` = Howard's tenant ID. See `02-auth/microsoft-login-plan.md`. | AD | ✅ Mitigated — `tenantGuard.ts` written, 4/4 tests pass |
| A2 | **Howard has blocked user consent**, so students see "Need admin approval" on first sign-in. | Med | High | Ask only for `openid profile email User.Read`. Send the Howard IT request early asking for admin consent. Keep the fallback login ready. | AD | ⏳ Open — run Step 4 consent test; one-click admin consent link added to IT email |
| A3 | **"Unverified" publisher warning** on the consent screen. Publisher verification needs a Microsoft partner (CPP) account tied to a verified domain — not realistic for a student team. | High | Low–Med | Accept the warning for a class project; explain it in demo. Keep scopes minimal — the stronger warning applies to apps asking for more than basic sign-in. | AD | ✅ Accepted — scopes limited to `User.Read` in `config.ts` |
| A4 | **No Entra directory to register in.** Since June 2024, personal Microsoft accounts can't register apps outside a directory. | High | Med | Create one via Azure for Students (free with Howard email) or the Microsoft 365 Developer Program. | AD | ⏳ Open — AD to create Azure for Students directory (Step 1) |
| A5 | **Cross-site cookies break login** (front end on Vercel, API on Render = different sites; Safari blocks third-party cookies). | High | High | Proxy `/api/*` through Vercel rewrites so the session cookie is first-party. Set `SameSite=Lax; Secure; HttpOnly`. | AD | ✅ Mitigated in code — `SameSite=Lax` cookie; Vercel rewrite in deploy checklist |
| A6 | Redirect URI mismatch between local, preview and prod. | High | Low | Register exact URIs for each environment; one backend callback per env. | AD | ✅ Mitigated — error table in login plan Step 4 |
| A7 | Org advisors (non-students, US-4.3) may sign in with staff accounts in the same tenant — role logic must not assume "every Howard login is a student". | Med | Med | Role comes from DB (`OrgManager.isStaff`), not from login. Confirm staff vs student email domains with Howard IT. | AD | ⏳ Open — roles from DB; confirm domains with IT |

## 2. Hosting and free tiers (NFR5)

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| H1 | Render free web service sleeps when idle → slow first load (cold start) during demo. | High | Med | Hit a `/health` endpoint before demos; scheduled ping via GitHub Actions; show a loading state (TR7). | DM |
| H2 | Supabase free project pauses after a period of inactivity. | Med | High | Keep a weekly CI job that queries the DB; check the current limit on Supabase's pricing page. | DM |
| H3 | Gemini free-tier rate limits hit during class demos or testing. | Med | Med | Cache feed rankings per user (e.g. 15 min); retry with backoff; non-AI fallback ranking (category match + trending). | DM |
| H4 | Free-tier background jobs: Render free has no reliable always-on worker for F7, F11, F22, F23. | High | Med | Run jobs from GitHub Actions cron hitting protected `/jobs/*` endpoints, or Supabase scheduled functions. | JM |
| H5 | Free-tier limits change mid-semester. | Low | Med | Re-check pricing pages at start of each sprint. | DM |

## 3. Notifications (F7, F23)

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| N1 | Web push on iPhone only works after the user adds the site to the Home Screen (installed PWA). Most students won't. | High | High | Default to **email** (free tier provider such as Resend/Brevo) + in-app notification bell; web push as opt-in extra. Close the open decision in week 1. | JM |
| N2 | Emails to `@howard.edu` land in spam/quarantine. | Med | Med | Verify a sending domain (SPF/DKIM); test early with team inboxes. | JM |
| N3 | Duplicate alerts for co-hosted events (TC-43). | Med | Low | Deduplicate by `(userId, eventId)` before sending. | JM |

## 4. AI features

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| G1 | Caption parser returns wrong dates ("this Friday", no year, emoji-heavy captions). | High | Med | Pass today's date + America/New_York to the prompt; force JSON schema output; human review step (US-6.3) is mandatory. | DM |
| G2 | Chat assistant hallucinates events that don't exist. | Med | High | Retrieve candidate events from DB first, let Gemini only rank/explain IDs from that list; drop any ID not in the list. | DM |
| G3 | "AI recommendations" are hard to test (TC-02). | Med | Low | Deterministic scoring layer + AI re-rank; test the deterministic part. | DM |
| G4 | Sending student data to Gemini. | Low | Med | Send interests/categories only, never names or emails; note it in the privacy page. | DM |

## 5. Browser extension (F15)

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| E1 | Instagram changes its page structure → extension breaks. | High | Med | Isolated DOM module, selector health check (TC-50), paste-box remains the permanent fallback (NFR4). | SM |
| E2 | Chrome Web Store review takes days and can reject vague permission use. | Med | Med | Submit at least 2 weeks before demo; only `instagram.com` host permission; clear privacy policy page. Load unpacked for demo as backup. | SM |
| E3 | Meta's terms on automated data collection. | Low–Med | Med | Extension reads only the post the logged-in org member is viewing, on click — no crawling, no background scraping. | SM |
| E4 | Follower count (for F11) may not be visible on the post page. | Med | Low | Submit partial data (US-6.6); F11 just skips that sample. | SM / AD |

## 6. Product and data

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| P1 | **Cold start: empty feed** — no orgs have posted, so the swipe feed has nothing. | High | High | Seed 30–50 real campus events by hand before any user testing; recruit 3–5 orgs as pilot posters. | SM / PF |
| P2 | Org-email verification (US-4.2) needs a way to prove the student controls the org email. | High | Med | Send a one-time code to the org email; store `verifiedAt`. | AD |
| P3 | Schedule upload: manual entry is tedious; parsing a BisonWeb schedule is fragile. | Med | Med | Start with a simple weekly grid of class blocks; import later. | PF |
| P4 | Timezones: events, schedules and .ics in different zones. | Med | Med | Store UTC, display America/New_York; include `TZID` in .ics. | JM |
| P5 | Recurring events (F22) generate duplicates or orphaned rows on edit. | Med | Low | Regenerate future rows only; keep `recurrenceId` on each Event. | SM |
| P6 | Privacy: friends' RSVPs, admin analytics (NFR3). | Med | High | Enforce in API queries, not UI; tests TC-15, TC-22, TC-40. | AD |
| P7 | Branding/permissions: using Howard name or logo, or implying official status. | Med | Med | Add "student project, not affiliated with Anthology or Howard" footer until approved. | DM |

## 7. Team and schedule

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| T1 | 25 features + 59 tests is a lot for one semester. | High | High | Build all **Must** (R1–R6, R11) first; Could items (R12–R15) only after a working demo. | All |
| T2 | Uneven load (JM/SM 12 items each vs AD 6, DM 7). | Med | Med | AD/DM take TR/NFR work; rebalance at Sprint 3 review. | All |
| T3 | Merge conflicts on `schema.prisma`. | High | Med | One schema owner (AD) merges migrations; others request changes via PR. | AD |
| T4 | 300-line file rule (TR8) blocks PRs late in the project. | Med | Low | Lint from day 1 in CI. | All |
| T5 | Blocked members waiting on auth. | High | Med | Dev-login stub (`DEV_AUTH=true`) so everyone builds features without Microsoft. | AD |
