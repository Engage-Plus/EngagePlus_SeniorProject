// Builds the Express app without listening, so tests can drive it with supertest.
// Routes are mounted at the root: in the browser they are reached through the
// `/api` proxy (Vite in dev, Vercel rewrite in prod) so cookies stay same-site.
import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { healthRouter } from "./routes/health.js";
import { errorHandler, notFound } from "./middleware/errors.js";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind Vercel / Render proxies
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use(healthRouter());
  // Feature routers (auth, events, orgs, ...) get mounted here.

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
