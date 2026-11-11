// JSON 404 + error handler. Every error body matches ApiErrorSchema in packages/shared.
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import type { ApiError } from "@engageplus/shared";

export const notFound: RequestHandler = (_req, res) => {
  const body: ApiError = { error: "Not found" };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
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
