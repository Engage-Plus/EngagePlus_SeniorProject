// Builds the Express app without listening, so tests can drive it with supertest.
// Routes are mounted at the root: in the browser they are reached through the
// `/api` proxy (Vite in dev, Vercel rewrite in prod) so cookies stay same-site.
import express, { type Express, type RequestHandler } from "express";
import cookieParser from "cookie-parser";
import { healthRouter } from "./routes/health.js";
import { parseCaptionRouter } from "./routes/parseCaption.js";
import { denyUntilAuthIsWired } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import type { JsonModel } from "./services/gemini.js";

export interface AppDeps {
  /** Guards signed-in routes. Defaults to "always 401" until F21 is wired. */
  requireUser?: RequestHandler;
  /** Gemini client; null/undefined = AI features use their non-AI fallbacks. */
  model?: JsonModel | null;
  now?: () => Date;
}

export function createApp(deps: AppDeps = {}): Express {
  const requireUser = deps.requireUser ?? denyUntilAuthIsWired;
  const model = deps.model ?? null;

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind Vercel / Render proxies
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use(healthRouter());
  app.use(parseCaptionRouter({ requireUser, model, now: deps.now }));
  // More feature routers (auth, events, orgs, ...) get mounted here.

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
