// GET /health    — cheap liveness check (TC-52; Render health check; wake-up ping, risk H1).
// GET /health/db — runs `SELECT 1` so deploys and the keep-alive job prove the DB is
//                  reachable and keep Supabase from pausing (TC-57, risk H2).
import { Router } from "express";
import type { DbHealthResponse, HealthResponse } from "@engageplus/shared";

export type PingDb = () => Promise<void>;

export function healthRouter(pingDb: PingDb): Router {
  const r = Router();

  r.get("/health", (_req, res) => {
    const body: HealthResponse = {
      status: "ok",
      service: "engageplus-api",
      time: new Date().toISOString(),
    };
    res.json(body);
  });

  r.get("/health/db", async (_req, res) => {
    const started = Date.now();
    try {
      await pingDb();
      const body: DbHealthResponse = { status: "ok", db: "ok", latencyMs: Date.now() - started };
      res.json(body);
    } catch (err) {
      // Log the reason server-side only; never echo connection details to clients.
      console.error("health/db failed:", err instanceof Error ? err.message : err);
      const body: DbHealthResponse = { status: "error", db: "unreachable", latencyMs: Date.now() - started };
      res.status(503).json(body);
    }
  });

  return r;
}
