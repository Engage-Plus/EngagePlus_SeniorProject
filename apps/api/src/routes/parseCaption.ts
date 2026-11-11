// POST /events/parse-caption {caption} -> suggested event fields (F14_01, TC-27).
// Signed-in users only; the result is never saved here, only returned for review.
import { Router, type RequestHandler } from "express";
import { ParseCaptionRequestSchema, type ParseCaptionResponse } from "@engageplus/shared";
import { parseCaption, type CaptionParserDeps } from "../services/captionParser/index.js";

export interface ParseCaptionRouteDeps extends CaptionParserDeps {
  requireUser: RequestHandler;
}

export function parseCaptionRouter(deps: ParseCaptionRouteDeps): Router {
  const r = Router();
  r.post("/events/parse-caption", deps.requireUser, async (req, res) => {
    const { caption } = ParseCaptionRequestSchema.parse(req.body); // ZodError -> 400
    const result: ParseCaptionResponse = await parseCaption(caption, deps);
    res.json(result);
  });
  return r;
}
