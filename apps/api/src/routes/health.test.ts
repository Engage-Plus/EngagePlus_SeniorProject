import request from "supertest";
import { DbHealthResponseSchema } from "@engageplus/shared";
import { createApp } from "../app.js";

beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => undefined));
afterEach(() => jest.restoreAllMocks());

test("TC-57 /health/db reports ok when the database answers", async () => {
  const res = await request(createApp({ pingDb: async () => undefined })).get("/health/db");
  expect(res.status).toBe(200);
  expect(DbHealthResponseSchema.parse(res.body)).toMatchObject({ status: "ok", db: "ok" });
});

test("TC-57 /health/db returns 503 without leaking connection details", async () => {
  const pingDb = async () => {
    throw new Error("connect ECONNREFUSED postgres://user:secret@db.example:5432");
  };
  const res = await request(createApp({ pingDb })).get("/health/db");
  expect(res.status).toBe(503);
  expect(DbHealthResponseSchema.parse(res.body)).toMatchObject({ status: "error", db: "unreachable" });
  expect(JSON.stringify(res.body)).not.toContain("secret");
});
