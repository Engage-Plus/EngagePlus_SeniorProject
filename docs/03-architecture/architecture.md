# Architecture

```
 Phone / desktop browser                Chrome extension (F15)
          │                                     │
          ▼                                     │ POST /api/events/extension-submit
 Vercel ─ React + TS + Vite + Tailwind (PWA)    │
          │  /api/* rewrite (same-site cookies) │
          ▼                                     ▼
 Render ─ Express + TS API ───────────────► Gemini API (F3, F14, F16)
          │        │                 └────► Email provider (F7, F23)
          │        └── Microsoft identity platform (F21)
          ▼
 Supabase ─ Postgres (Prisma) + Storage (flyers)
          ▲
 GitHub Actions ─ CI (TR5) + cron → /api/jobs/* (F7 fan-out, F11, F22, F23, keep-alive)
```

## Key decisions
- **Same-site API.** `vercel.json` rewrites `/api/:path*` → `https://<render-app>.onrender.com/:path*`. Avoids third-party-cookie problems on Safari/iOS.
- **Feed pipeline (F3).** 1) SQL filter: upcoming, published, not conflicting with schedule (F12), category filter (F13), not already swiped. 2) Deterministic score: interest match + follows + trending. 3) Gemini re-rank top 50 → cached per user 15 min. 4) Fallback to trending (F4) when no data or AI fails.
- **Chat (F16).** Parse time words server-side (America/New_York), retrieve candidate events from DB, Gemini picks IDs + one-line reasons from that list only.
- **Caption parser (F14).** Gemini with a JSON schema response; fields missing → `null`; always followed by human review (US-6.3).
- **Jobs.** Protected by `JOBS_SECRET` header; idempotent so retries are safe.
- **Folder layout**
  ```
  apps/web      React front end
  apps/api      Express API (routes/, services/, jobs/, middleware/)
  apps/extension  Manifest V3 extension
  packages/shared Types + zod schemas shared by web/api
  prisma/       schema.prisma, migrations, seed.ts
  ```
