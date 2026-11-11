// Placeholder until F21 (AD) mounts real sessions: every protected route answers 401,
// so nothing is reachable without auth by accident. AD: replace with requireAuth(secret)
// from apps/api/src/auth/session.ts when wiring createApp({ requireUser }).
import type { RequestHandler } from "express";
import type { ApiError } from "@engageplus/shared";

export const denyUntilAuthIsWired: RequestHandler = (_req, res) => {
  res.status(401).json({ error: "Sign in required" } satisfies ApiError);
};
