// Typed fetch helper. Every response is validated with the zod schema from
// packages/shared, so a contract drift fails loudly instead of rendering garbage.
import type { z } from "zod";
import { ApiErrorSchema, HealthResponseSchema } from "@engageplus/shared";

export const API_BASE = "/api";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function apiGet<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiRequestError("Can't reach Engage+. Check your connection.", 0);
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = ApiErrorSchema.safeParse(body);
    throw new ApiRequestError(err.success ? err.data.error : `Request failed (${res.status})`, res.status);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiRequestError("Unexpected response from server.", res.status);
  return parsed.data;
}

export const getHealth = () => apiGet("/health", HealthResponseSchema);
