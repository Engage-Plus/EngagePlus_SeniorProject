# Microsoft Login Plan (F21, R11, NFR2)

_Updated Nov 11, 2026 — fix chosen, starter code written and tested. See "Results" at the bottom._

## The problem in one line
To restrict login to Howard, the app either lives in Howard's tenant (needs Howard IT) or lives in your own directory and checks the tenant itself — and in both cases Howard can still block students from consenting.

## The fix (do these in order)

### Step 1 — Create your own directory (AD, 15 min)
Sign up for **Azure for Students** with your Howard email. This gives you an Entra directory you control. (Personal Microsoft accounts can't register apps outside a directory anymore.)

### Step 2 — Register a multi-tenant app (AD, 15 min)
Entra admin center → App registrations → New registration
- Name: `Engage+`
- Supported account types: **Accounts in any organizational directory (Multitenant)**
- Redirect URI (Web): `http://localhost:4000/auth/microsoft/callback`
- After creating, add the prod URI: `https://<app>.vercel.app/api/auth/microsoft/callback`
- Certificates & secrets → New client secret → copy the **Value** into `.env` as `MS_CLIENT_SECRET`. Add the expiry date to the team calendar.
- API permissions: keep **only** Microsoft Graph delegated `User.Read` (openid/profile/email are added automatically). Do **not** add Mail, Calendars, Files, Teams — those now need admin approval.

### Step 3 — Lock it to Howard in code (done — `starter-code/`)
1. Get Howard's tenant ID: open
   `https://login.microsoftonline.com/howard.edu/v2.0/.well-known/openid-configuration`
   and copy the GUID inside `issuer`. Put it in `.env` as `HOWARD_TENANT_ID`.
2. `MS_AUTHORITY=https://login.microsoftonline.com/organizations` — only work/school accounts can sign in.
3. `tenantGuard.ts` rejects any login whose `tid` isn't Howard's (and checks the issuer). This is what satisfies NFR2 / TC-17 without Howard IT registering the app.
4. `domainHint: "howard.edu"` sends students straight to Howard's sign-in page.

### Step 4 — Run the consent test (AD + 2 teammates, 10 min)
Each person who has **never** used the app signs in at `/auth/microsoft` with their Howard account:

| What you see | Meaning | Next step |
|---|---|---|
| Consent screen listing basic permissions, "Unverified" label → Accept → lands on `/feed` | Howard allows user consent for basic sign-in | **Done.** Use Path B for the whole project. |
| "Need admin approval" / app redirects with `error=ADMIN_CONSENT_REQUIRED` | Howard blocks user consent | Send `howard-it-request.md` (one-click admin consent link) and use Path C until approved. |
| `error=WRONG_TENANT` | You signed in with a non-Howard account | Expected (TC-17 passes). |
| AADSTS50011 redirect URI mismatch | URI in Entra ≠ `MS_REDIRECT_URI` | Make them identical, including `http` vs `https` and trailing slash. |
| AADSTS7000215 invalid client secret | Copied the Secret **ID** instead of **Value** | Create a new secret and copy the Value. |

Record what happened in `auth-test-results.md`.

### Step 5 — Never be blocked (Path C, already in code)
- `devLogin.ts`: `POST /auth/dev-login` with a seeded email. Only mounted when `DEV_AUTH=true`; the config throws if it's on in production.
- If Howard IT says no: switch production login to an email one-time code restricted to Howard email domains (Supabase Auth, free tier). Note it in the final report as an R11 scope change.

## About the "Unverified" label
Publisher verification needs a Microsoft partner account and a verified company domain, so a student team can't realistically get it. It's a warning, not a block. Mention it in the demo; if Howard IT registers the app in their own tenant (Path A), the label goes away.

## Paths summary
| Path | Who registers | Unverified label | Can be blocked by consent policy | Status |
|---|---|---|---|---|
| A — Howard IT | Howard IT | No | No | Request drafted |
| **B — Own multi-tenant + tenant check** | AD | Yes | Yes (fix: admin consent link) | **Chosen; code done** |
| C — Dev login / email code | Team | n/a | No | Dev login done; email code if needed |

## Wiring it into the API
```ts
import express from "express";
import cookieParser from "cookie-parser";
import { loadAuthConfig } from "./auth/config.js";
import { microsoftRoutes } from "./auth/microsoftRoutes.js";
import { devLoginRoutes } from "./auth/devLogin.js";

const cfg = loadAuthConfig();
const app = express();
app.use(express.json(), cookieParser());
app.use(microsoftRoutes(cfg, upsertUserWithPrisma)); // upsert by msOid
app.use(devLoginRoutes(cfg, findSeedUserByEmail));
```
`upsertUserWithPrisma` should upsert on `User.msOid` (the `oid` claim), not on email. Roles come from the database: `STUDENT` by default, `ADMIN` only set by seed/DB.

## Results (Nov 11, 2026)
| Check | Result |
|---|---|
| Starter code typechecks (TypeScript strict, `tsc`) | ✅ Pass |
| TC-17 unit test — Howard tenant accepted, other tenant / missing claims / wrong issuer rejected | ✅ 4/4 pass |
| Every auth file under 300 lines (TR8) | ✅ Largest is 91 lines |
| Live sign-in with a Howard account | ⏳ Not run yet — needs Steps 1–2 and a Howard login (Step 4) |
| Howard user-consent policy | ⏳ Unknown until Step 4 |
