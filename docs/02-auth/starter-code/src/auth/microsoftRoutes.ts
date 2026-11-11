// Microsoft sign-in routes (F21 / F21_02 / TC-17).
// GET /auth/microsoft          -> redirect to Microsoft
// GET /auth/microsoft/callback -> exchange code, check Howard tenant, set session
import { Router } from "express";
import crypto from "node:crypto";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { type AuthConfig, LOGIN_SCOPES } from "./config.js";
import { checkHowardTenant, type IdClaims } from "./tenantGuard.js";
import { setSession, clearSession, type SessionUser } from "./session.js";

// Injected so this file stays free of Prisma details (owned by AD in TR3).
export type UpsertUser = (u: { msOid: string; email: string; name: string }) =>
  Promise<SessionUser>;

const STATE_COOKIE = "ep_oauth_state";

export function microsoftRoutes(cfg: AuthConfig, upsertUser: UpsertUser): Router {
  const r = Router();
  const msal = new ConfidentialClientApplication({
    auth: {
      clientId: cfg.MS_CLIENT_ID,
      clientSecret: cfg.MS_CLIENT_SECRET,
      authority: cfg.MS_AUTHORITY,
    },
  });

  r.get("/auth/microsoft", async (_req, res, next) => {
    try {
      const state = crypto.randomBytes(16).toString("hex");
      res.cookie(STATE_COOKIE, state, {
        httpOnly: true,
        sameSite: "lax",
        secure: cfg.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
      });
      const url = await msal.getAuthCodeUrl({
        scopes: LOGIN_SCOPES,
        redirectUri: cfg.MS_REDIRECT_URI,
        state,
        domainHint: "howard.edu", // skips the account picker for Howard users
        prompt: "select_account",
      });
      res.redirect(url);
    } catch (err) {
      next(err);
    }
  });

  r.get("/auth/microsoft/callback", async (req, res) => {
    const fail = (code: string) =>
      res.redirect(`${cfg.WEB_ORIGIN}/login?error=${encodeURIComponent(code)}`);

    // Microsoft sends error=consent_required / access_denied when consent is blocked.
    if (typeof req.query.error === "string") {
      const desc = String(req.query.error_description ?? "");
      const needsAdmin = /AADSTS90094|AADSTS65001|admin/i.test(desc);
      return fail(needsAdmin ? "ADMIN_CONSENT_REQUIRED" : req.query.error);
    }

    const code = req.query.code;
    const state = req.query.state;
    const expectedState: unknown = req.cookies?.[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE);
    if (typeof code !== "string" || typeof state !== "string" || state !== expectedState) {
      return fail("INVALID_STATE");
    }

    try {
      const result = await msal.acquireTokenByCode({
        code,
        scopes: LOGIN_SCOPES,
        redirectUri: cfg.MS_REDIRECT_URI,
      });
      const guard = checkHowardTenant(result.idTokenClaims as IdClaims, cfg.HOWARD_TENANT_ID);
      if (!guard.ok) return fail(guard.reason);

      const user = await upsertUser({ msOid: guard.oid, email: guard.email, name: guard.name });
      setSession(res, user, cfg.SESSION_SECRET);
      return res.redirect(`${cfg.WEB_ORIGIN}/feed`);
    } catch {
      return fail("TOKEN_EXCHANGE_FAILED");
    }
  });

  r.post("/auth/logout", (_req, res) => {
    clearSession(res);
    res.status(204).end();
  });

  return r;
}
