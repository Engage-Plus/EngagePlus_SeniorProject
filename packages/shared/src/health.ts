// GET /health response (TR1, TC-52). Also used before demos to wake the API (risk H1).
import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  time: z.iso.datetime(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/** GET /health/db: proves the API can read from Postgres/Supabase (TR6, TC-57; risk H2). */
export const DbHealthResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  db: z.enum(["ok", "unreachable"]),
  latencyMs: z.number().nonnegative(),
});
export type DbHealthResponse = z.infer<typeof DbHealthResponseSchema>;

/** Every API error body has this shape. */
export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
