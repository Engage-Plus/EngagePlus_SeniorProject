# Engage+

Mobile-first website for Howard students to discover events and orgs by swiping. Read [CLAUDE.md](CLAUDE.md) first — it holds the team rules and the PRD tracker. Planning docs live in [docs/](docs/README.md).

## Quick start (no Docker)

Requires Node 20.19+ (Node 22+ recommended).

```bash
npm install            # installs all workspaces + generates the Prisma client
npm run dev            # API on http://localhost:4000, web on http://localhost:5173
```

Open http://localhost:5173 — the home page shows "API online" when the front end can reach the API through the `/api` proxy.

## Scripts (run from the repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Builds `packages/shared`, then runs API (tsx watch) + web (Vite) together |
| `npm run build` | Production build of shared → api (`apps/api/dist`) → web (`apps/web/dist`) |
| `npm run lint` | ESLint; fails on `any` and on any file over 300 lines (TR8) |
| `npm run typecheck` | `tsc --noEmit` for every workspace |
| `npm test` | Jest across shared, api, web (jsdom) and repo-level tests |

`npm run lint && npm run typecheck && npm test` must pass before every PR.

## Layout

```
apps/api          Express + TypeScript. createApp() in src/app.ts, routes mounted at root
apps/web          React + Vite + Tailwind v4. Calls /api/*, proxied to the API in dev
packages/shared   zod schemas + types shared by web and api (build before api/web)
prisma/           schema.prisma (owned by AD), migrations, seed
tests/            Repo-level tests (e.g. TC-59 lint rules) and Jest helpers
docs/             Planning kit
```

## How `/api` works

The browser always calls `/api/...`. Vite (dev) and Vercel (prod) forward that to Express and strip the `/api` prefix, so API routes are defined at the root (`/health`, `/auth/microsoft`, …) and session cookies stay first-party (risk A5). Override the dev proxy target with `API_PROXY_TARGET` (e.g. `http://api:4000` inside Docker Compose).

## Notes

- **npm 11 install scripts:** `allowScripts` in `package.json` lists the packages allowed to run install scripts (Prisma engines, esbuild). If you bump their versions, run `npm approve-scripts <pkg>`.
- **TypeScript is pinned to 5.9** because ts-jest and typescript-eslint don't support TypeScript 7 yet.
- **Prisma is pinned to 6.x** because the schema uses `url`/`directUrl` in the datasource block, which Prisma 7 removed.
