// Session cookie helpers + route guards (F21, TC-15).
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface SessionUser {
  userId: string;
  role: "STUDENT" | "ADMIN";
}

const COOKIE = "ep_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function setSession(res: Response, user: SessionUser, secret: string): void {
  const token = jwt.sign(user, secret, { expiresIn: "7d" });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // works because /api is proxied through the web origin
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearSession(res: Response): void {
  res.clearCookie(COOKIE, { path: "/" });
}

export function readSession(req: Request, secret: string): SessionUser | null {
  const token: unknown = req.cookies?.[COOKIE];
  if (typeof token !== "string") return null;
  try {
    const p = jwt.verify(token, secret) as jwt.JwtPayload & SessionUser;
    return { userId: p.userId, role: p.role };
  } catch {
    return null;
  }
}

export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = readSession(req, secret);
    if (!user) return res.status(401).json({ error: "Sign in required" });
    res.locals.user = user;
    next();
  };
}

export function requireAdmin(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = readSession(req, secret);
    if (!user) return res.status(401).json({ error: "Sign in required" });
    if (user.role !== "ADMIN") return res.status(403).json({ error: "Admins only" });
    res.locals.user = user;
    next();
  };
}
