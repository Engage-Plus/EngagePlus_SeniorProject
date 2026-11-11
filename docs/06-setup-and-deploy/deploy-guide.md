# Deploy Guide (TR6, TC-57 · NFR5, TC-51)

Step-by-step first deploy. The config is already in the repo:
- `apps/web/vercel.json`: build, `/api/*` rewrite to Render, SPA fallback.
- `render.yaml`: Render Blueprint for the API (free plan).
- `.github/workflows/keep-alive.yml`: daily wake-up and DB ping.

Order: **Supabase → Render → Vercel → wire the URLs → verify.** Owner: DM. Microsoft redirect URIs: AD.

## 1. Supabase (database + storage)
1. Create a project on the **Free** plan. Pick a US East region (close to Render `virginia`).
2. Project Settings → Database → Connection string:
   - **Transaction pooler** (port 6543): append `?pgbouncer=true&connection_limit=1`. This is `DATABASE_URL`.
   - **Direct connection** (port 5432). This is `DIRECT_URL` (used by `prisma migrate deploy`).
3. Storage → create a bucket named `flyers` (public read; SM decides the upload policy in F10_02).
4. Project Settings → API: copy the project URL (`SUPABASE_URL`) and the `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`). The service-role key is server-only and must never go to the web app.
5. Apply migrations once TR3 has added them: `DIRECT_URL=... DATABASE_URL=... npx prisma migrate deploy` (later this runs from CI, TR5).

## 2. Render (API)
1. Render → New → **Blueprint** → select this repo. It reads `render.yaml`.
2. Keep the service name `engageplus-api` so the URL is `https://engageplus-api.onrender.com`. If that name is taken, update the rewrite in `apps/web/vercel.json`.
3. Fill in every `sync: false` variable. `SESSION_SECRET` and `JOBS_SECRET` are generated for you.
4. Deploy, then open `https://engageplus-api.onrender.com/health`. It should return `{"status":"ok",...}`.

## 3. Vercel (web)
1. Vercel → Add New → Project → import this repo.
2. Set **Root Directory** to `apps/web`. Everything else comes from `vercel.json`.
3. No environment variables are needed. The web app only calls `/api/*`.
4. Deploy, then copy the production URL (e.g. `https://engageplus.vercel.app`).

## 4. Wire the URLs together
- Render: set `WEB_ORIGIN` to the Vercel URL.
- AD: add `https://<vercel-app>/api/auth/microsoft/callback` to the Entra app and set `MS_REDIRECT_URI` on Render to the same value.
- GitHub → Settings → Secrets and variables → Actions → **Variables**: `API_URL = https://engageplus-api.onrender.com`.

## 5. Verify (TC-57)
| Check | Expected |
|---|---|
| `https://<vercel-app>/` | Home page loads and shows "API online" (through the rewrite) |
| `https://<vercel-app>/api/health/db` | `{"status":"ok","db":"ok",...}`, which proves the API reads from Supabase |
| Deep link `https://<vercel-app>/anything` | App shell with "Page not found", not a Vercel 404 |
| Actions → keep-alive → Run workflow | Green |

Record the result in the RTM (TC-57).

## Free-tier check (NFR5, TC-51)
Confirm each service is on its free plan at deploy time and re-check the pricing pages each sprint, because limits change (risk H5).

| Service | Plan to select | Known free-tier behaviour we plan around |
|---|---|---|
| Vercel | Hobby | Non-commercial use only. Fine for a class project |
| Render | Free web service | Sleeps when idle, so the first request is slow. Use keep-alive or Run workflow before demos (H1) |
| Supabase | Free | Pauses after inactivity. The daily `/health/db` ping prevents it (H2) |
| Gemini (Google AI Studio) | Free tier | Rate limits. Feed re-rank is cached 15 min, and every AI feature has a non-AI fallback (H3) |
| GitHub Actions | Free (public repo) or included minutes | Keep-alive uses well under 1 min/day |
| Chrome Web Store | $5 one-time developer fee | The only allowed spend (F15) |

| Date checked | Checked by | All free? | Notes |
|---|---|---|---|
| | | | |

## Troubleshooting
- **Home page says "Can't reach Engage+".** Render is asleep or the rewrite URL is wrong. Open the Render URL `/health` directly.
- **`/api/health/db` returns 503.** Check `DATABASE_URL` on Render and whether the Supabase project is paused (resume it in the dashboard). Details are in the Render logs only.
- **Build fails on Render with `tsc: not found`.** The build command must keep `--include=dev`, because `NODE_ENV=production` would otherwise skip devDependencies.
- **Prisma "prepared statement already exists".** `DATABASE_URL` is missing `?pgbouncer=true`.
