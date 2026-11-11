// Placeholder until F21 (AD) mounts real sessions: every protected route answers 401,
// so nothing is reachable without auth by accident. AD: replace with requireAuth(secret)
// from apps/api/src/auth/session.ts when wiring createApp({ requireUser }).
import type { RequestHandler, Response } from "express";
import { z } from "zod";
import type { ApiError } from "@engageplus/shared";
import { HttpError } from "./errors.js";

export const denyUntilAuthIsWired: RequestHandler = (_req, res) => {
  res.status(401).json({ error: "Sign in required" } satisfies ApiError);
};

// Matches SessionUser in docs/02-auth/starter-code/src/auth/session.ts (set on res.locals.user).
const SessionUserSchema = z.object({ userId: z.string().min(1), role: z.enum(["STUDENT", "ADMIN"]) });
export type SessionUser = z.infer<typeof SessionUserSchema>;

/** The signed-in user set by `requireUser`. Throws 401 if a route forgot the guard. */
export function currentUser(res: Response): SessionUser {
  const parsed = SessionUserSchema.safeParse(res.locals.user);
  if (!parsed.success) throw new HttpError(401, "Sign in required");
  return parsed.data;
}
