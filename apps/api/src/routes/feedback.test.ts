import request from "supertest";
import type { RequestHandler } from "express";
import { PendingFeedbackResponseSchema, SubmitFeedbackResponseSchema } from "@engageplus/shared";
import { createApp } from "../app.js";
import { memoryRepo, NOW } from "../services/feedback/fixtures.js";

const signedInAs =
  (userId: string): RequestHandler =>
  (_req, res, next) => {
    res.locals.user = { userId, role: "STUDENT" };
    next();
  };

function setup(userId = "u1") {
  const m = memoryRepo();
  m.addEvent("ended", 1, ["u1"]);
  m.addEvent("future", -3, ["u1"]);
  const app = createApp({ requireUser: signedInAs(userId), feedbackRepo: m.repo, now: () => NOW });
  return { m, app };
}

test("TC-05 GET /feedback/pending lists ended RSVP'd events", async () => {
  const { app } = setup();
  const res = await request(app).get("/feedback/pending");
  expect(res.status).toBe(200);
  expect(PendingFeedbackResponseSchema.parse(res.body).events.map((e) => e.id)).toEqual(["ended"]);
});

test("TC-05 POST /feedback/:eventId saves the rating for the session user", async () => {
  const { app, m } = setup();
  // A userId in the body is ignored: identity comes from the session only.
  const res = await request(app).post("/feedback/ended").send({ thumbsUp: true, userId: "someone-else" });
  expect(res.status).toBe(200);
  expect(SubmitFeedbackResponseSchema.parse(res.body)).toEqual({ eventId: "ended", thumbsUp: true });
  expect(m.rating("u1", "ended")).toBe(true);
  expect(m.rating("someone-else", "ended")).toBeUndefined();

  const after = await request(app).get("/feedback/pending");
  expect(after.body.events).toEqual([]);
});

test("TC-05 POST /feedback validates input and permissions", async () => {
  const { app } = setup();
  expect((await request(app).post("/feedback/ended").send({ thumbsUp: "yes" })).status).toBe(400);
  expect((await request(app).post("/feedback/ended").send({})).status).toBe(400);
  expect((await request(app).post("/feedback/future").send({ thumbsUp: true })).status).toBe(409);
  expect((await request(app).post("/feedback/missing").send({ thumbsUp: true })).status).toBe(404);

  const stranger = setup("u2").app;
  const res = await request(stranger).post("/feedback/ended").send({ thumbsUp: true });
  expect(res.status).toBe(403);
  expect(res.body.error).toMatch(/RSVP/);
});

test("TC-05 feedback routes require sign-in", async () => {
  const m = memoryRepo();
  const app = createApp({ feedbackRepo: m.repo });
  expect((await request(app).get("/feedback/pending")).status).toBe(401);
  expect((await request(app).post("/feedback/x").send({ thumbsUp: true })).status).toBe(401);
});
