// GET /health — cheap liveness check (TC-52; wake-up ping before demos, risk H1).
import { Router } from "express";
import type { HealthResponse } from "@engageplus/shared";

export function healthRouter(): Router {
  const r = Router();
  r.get("/health", (_req, res) => {
    const body: HealthResponse = {
      status: "ok",
      service: "engageplus-api",
      time: new Date().toISOString(),
    };
    res.json(body);
  });
  return r;
}
