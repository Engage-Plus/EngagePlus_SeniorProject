import request from "supertest";
import { Category, Role, SwipeAction } from "@prisma/client";
import { CategorySchema, HealthResponseSchema, RoleSchema, SwipeActionSchema } from "@engageplus/shared";
import { createApp } from "./app.js";
import { loadEnv } from "./env.js";

const app = createApp();

test("TC-52 API boots and answers /health", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(HealthResponseSchema.parse(res.body).service).toBe("engageplus-api");
});

test("TC-52 unknown routes return a JSON 404", async () => {
  const res = await request(app).get("/does-not-exist");
  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: "Not found" });
});

test("TC-52 malformed JSON returns 400, not 500", async () => {
  const res = await request(app)
    .post("/health")
    .set("Content-Type", "application/json")
    .send("{not json");
  expect(res.status).toBe(400);
});

test("TC-52 shared enums match the Prisma schema", () => {
  expect([...CategorySchema.options].sort()).toEqual(Object.values(Category).sort());
  expect([...RoleSchema.options].sort()).toEqual(Object.values(Role).sort());
  expect([...SwipeActionSchema.options].sort()).toEqual(Object.values(SwipeAction).sort());
});

test("TC-52 env defaults and validation", () => {
  expect(loadEnv({}).PORT).toBe(4000);
  expect(() => loadEnv({ PORT: "abc" })).toThrow();
});
