import request from "supertest";
import type { RequestHandler } from "express";
import { CHAT_MESSAGE_MAX_LENGTH, ChatResponseSchema } from "@engageplus/shared";
import { createApp } from "../app.js";
import { everything, NOW } from "../services/chat/fixtures.js";

const signedIn: RequestHandler = (_req, _res, next) => next();
const app = createApp({ requireUser: signedIn, model: null, now: () => NOW, chatCandidates: everything });

test("TC-34 POST /chat returns events with reasons", async () => {
  const res = await request(app).post("/chat").send({ message: "career events" });
  expect(res.status).toBe(200);
  const body = ChatResponseSchema.parse(res.body);
  expect(body.results.length).toBeGreaterThan(0);
});

test("TC-34 /chat validates input", async () => {
  expect((await request(app).post("/chat").send({ message: "" })).status).toBe(400);
  expect((await request(app).post("/chat").send({})).status).toBe(400);
  const long = "x".repeat(CHAT_MESSAGE_MAX_LENGTH + 1);
  expect((await request(app).post("/chat").send({ message: long })).status).toBe(400);
});

test("TC-34 /chat requires sign-in", async () => {
  const res = await request(createApp({ chatCandidates: everything })).post("/chat").send({ message: "hi" });
  expect(res.status).toBe(401);
});
