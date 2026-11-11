// Dev-only login (Path C). Lets the whole team build features before
// Microsoft sign-in is approved. Never mounted when DEV_AUTH !== "true".
import { Router } from "express";
import type { AuthConfig } from "./config.js";
import { setSession, type SessionUser } from "./session.js";

export type FindSeedUser = (email: string) => Promise<SessionUser | null>;

export function devLoginRoutes(cfg: AuthConfig, findSeedUser: FindSeedUser): Router {
  const r = Router();
  if (cfg.DEV_AUTH !== "true") return r;

  r.post("/auth/dev-login", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const user = await findSeedUser(email);
    if (!user) return res.status(404).json({ error: "No seeded user with that email" });
    setSession(res, user, cfg.SESSION_SECRET);
    res.json({ ok: true });
  });

  return r;
}
