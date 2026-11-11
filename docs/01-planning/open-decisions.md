# Open Decisions Log

| # | Decision | Options | Recommendation | Owner | Due | Status |
|---|---|---|---|---|---|---|
| D1 | Auth path | A Howard IT · B own multi-tenant + `tid` check · C email OTP fallback | **Decided: B** (own multi-tenant app + Howard tenant check). A only if consent blocked; C (dev login) in code | AD | Week 2 | ✅ Decided Nov 11 — live test pending |
| D2 | Notification channel (F7, F23) | Web push · email · both | Email + in-app bell; web push opt-in (iOS needs Home Screen install) | JM | Week 1 | Open |
| D3 | Confirm P10 calendar-planner persona | Keep · revert to night commuter | Keep; S1 stays deferred | All | Week 1 | Open |
| D4 | Time/location filters from first draft | Keep · drop | Drop for now; chat (F16) covers "now/near" | PF | Week 2 | Open |
| D5 | Semester start date (TC-26) | Fixed dates in config · admin-set | `SEMESTER_STARTS` config list (e.g. Aug and Jan dates from Howard's academic calendar) | JM | Week 3 | Open |
| D6 | Admin view scope (F25) | Meet Student Activities contact first | Required by PRD before build | DM | Week 6 | Open |
| D7 | Background jobs runtime | GitHub Actions cron · Supabase scheduled functions | GitHub Actions cron → protected `/jobs/*` | JM | Week 3 | Open |
| D8 | Email provider | Resend · Brevo · other free tier | Pick one with free tier + domain verification | JM | Week 3 | Open |
| D9 | Org email verification method (US-4.2) | One-time code · manual admin check | One-time code to org email | AD | Week 3 | Open |
