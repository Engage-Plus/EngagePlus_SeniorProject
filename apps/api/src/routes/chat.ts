// POST /chat {message} -> matching upcoming events with reasons (F16, TC-34–36).
import { Router, type RequestHandler } from "express";
import { ChatRequestSchema, type ChatResponse } from "@engageplus/shared";
import { answerChat, type ChatDeps } from "../services/chat/index.js";

export interface ChatRouteDeps extends ChatDeps {
  requireUser: RequestHandler;
}

export function chatRouter(deps: ChatRouteDeps): Router {
  const r = Router();
  r.post("/chat", deps.requireUser, async (req, res) => {
    const { message } = ChatRequestSchema.parse(req.body); // ZodError -> 400
    const result: ChatResponse = await answerChat(message, deps);
    res.json(result);
  });
  return r;
}
