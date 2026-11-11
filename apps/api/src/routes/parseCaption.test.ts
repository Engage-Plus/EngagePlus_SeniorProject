import request from "supertest";
import type { RequestHandler } from "express";
import { CAPTION_MAX_LENGTH, ParseCaptionResponseSchema } from "@engageplus/shared";
import { createApp } from "../app.js";
import { CAREER_CAPTION, NOW } from "../services/captionParser/fixtures.js";

const signedIn: RequestHandler = (_req, _res, next) => next();
const app = createApp({ requireUser: signedIn, model: null, now: () => NOW });

test("TC-27 POST /events/parse-caption returns parsed fields as JSON", async () => {
  const res = await request(app).post("/events/parse-caption").send({ caption: CAREER_CAPTION });
  expect(res.status).toBe(200);
  const body = ParseCaptionResponseSchema.parse(res.body);
  expect(body.fields).toMatchObject({
    title: "Fall Career Fair Prep Workshop",
    date: "2026-11-13",
    startTime: "18:00",
    location: "Blackburn Center Ballroom",
    category: "PROFESSIONAL",
  });
});

test("TC-27 parse-caption validates input with zod", async () => {
  const empty = await request(app).post("/events/parse-caption").send({ caption: "   " });
  expect(empty.status).toBe(400);
  const long = await request(app)
    .post("/events/parse-caption")
    .send({ caption: "x".repeat(CAPTION_MAX_LENGTH + 1) });
  expect(long.status).toBe(400);
  const wrongType = await request(app).post("/events/parse-caption").send({ caption: 42 });
  expect(wrongType.status).toBe(400);
});

test("TC-27 parse-caption requires sign-in (401 until auth is wired)", async () => {
  const res = await request(createApp()).post("/events/parse-caption").send({ caption: "Mixer" });
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: "Sign in required" });
});
