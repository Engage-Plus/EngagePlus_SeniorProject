// GET /feedback/pending · POST /feedback/:eventId {thumbsUp} (F5_01, TC-05).
// The user always comes from the session, never from the request body.
import { Router, type RequestHandler } from "express";
import { z } from "zod";
import {
  SubmitFeedbackRequestSchema,
  type PendingFeedbackResponse,
  type SubmitFeedbackResponse,
} from "@engageplus/shared";
import { currentUser } from "../middleware/auth.js";
import { listPendingFeedback, submitFeedback, type FeedbackDeps } from "../services/feedback/index.js";

export interface FeedbackRouteDeps extends FeedbackDeps {
  requireUser: RequestHandler;
}

const EventIdParam = z.object({ eventId: z.string().min(1).max(64) });

export function feedbackRouter(deps: FeedbackRouteDeps): Router {
  const r = Router();

  r.get("/feedback/pending", deps.requireUser, async (_req, res) => {
    const { userId } = currentUser(res);
    const body: PendingFeedbackResponse = { events: await listPendingFeedback(userId, deps) };
    res.json(body);
  });

  r.post("/feedback/:eventId", deps.requireUser, async (req, res) => {
    const { userId } = currentUser(res);
    const { eventId } = EventIdParam.parse(req.params);
    const { thumbsUp } = SubmitFeedbackRequestSchema.parse(req.body);
    await submitFeedback(userId, eventId, thumbsUp, deps);
    const body: SubmitFeedbackResponse = { eventId, thumbsUp };
    res.json(body);
  });

  return r;
}
