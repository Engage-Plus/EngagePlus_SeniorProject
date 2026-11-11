// JSON 404 + error handler. Every error body matches ApiErrorSchema in packages/shared.
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import type { ApiError } from "@engageplus/shared";

/** Throw from a route to send `{error: message}` with `status` (e.g. 403, 404, 409). */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const notFound: RequestHandler = (_req, res) => {
  const body: ApiError = { error: "Not found" };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message } satisfies ApiError);
    return;
  }
  if (err instanceof ZodError) {
    const body: ApiError = { error: "Invalid request", details: err.issues };
    res.status(400).json(body);
    return;
  }
  if (err instanceof SyntaxError) {
    // Malformed JSON body from express.json()
    res.status(400).json({ error: "Invalid JSON body" } satisfies ApiError);
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" } satisfies ApiError);
};
