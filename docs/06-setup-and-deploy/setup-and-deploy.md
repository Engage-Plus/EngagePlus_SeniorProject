# Setup and Deployment

## Accounts the team needs (all free)
| Service | Used for | Who creates | Notes |
|---|---|---|---|
| GitHub org/repo | Code, CI, cron jobs | DM | Add all 5 as members; protect `main` |
| Vercel | Front end (TR6) | DM | Connect repo, root `apps/web` |
| Render | API (TR6) | DM | Free web service, root `apps/api` |
| Supabase | Postgres + Storage | DM | Create `flyers` bucket |
| Azure for Students / Entra | Microsoft login | AD | See `02-auth/` |
| Google AI Studio | Gemini key | DM | One key per environment |
| Email provider | Notifications, org codes | JM | Verify sending domain |
| Chrome Web Store dev account | Extension | SM | $5 one-time fee (NFR5) |

## Local setup
1. `git clone` the repo, `cp docs/06-setup-and-deploy/.env.example .env`.
2. `docker compose up --build` (TC-53).
3. `npx prisma migrate dev && npx prisma db seed`.
4. Open http://localhost:5173 → use **Dev login** until Microsoft is configured.

## Deploy checklist (TC-57)
- [ ] Supabase: run `prisma migrate deploy` from CI with `DIRECT_URL`.
- [ ] Render: set all env vars; `DEV_AUTH=false`; health check `/jobs/health`.
- [ ] Vercel: `vercel.json`
  ```json
  { "rewrites": [ { "source": "/api/:path*", "destination": "https://<render-app>.onrender.com/:path*" },
                  { "source": "/(.*)", "destination": "/index.html" } ] }
  ```
- [ ] Microsoft app: add prod redirect `https://<app>.vercel.app/api/auth/microsoft/callback`.
- [ ] GitHub Actions cron: notify (every 15 min), velocity (daily), recurrences (daily), digest (weekly), keep-alive before demos.
- [ ] Confirm every service is on a free plan (TC-51).
- [ ] Before a demo: wake the API, check Supabase isn't paused, run the smoke test.
