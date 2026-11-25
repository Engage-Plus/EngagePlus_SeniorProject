import { ApiErrorSchema, CategorySchema, HealthResponseSchema } from "./index.js";

test("TC-52 health contract accepts a valid response and rejects a bad one", () => {
  const ok = { status: "ok", service: "engageplus-api", time: new Date().toISOString() };
  expect(HealthResponseSchema.parse(ok)).toEqual(ok);
  expect(HealthResponseSchema.safeParse({ ...ok, status: "down" }).success).toBe(false);
  expect(HealthResponseSchema.safeParse({ ...ok, time: "yesterday" }).success).toBe(false);
});

test("TC-52 shared enums and error shape parse", () => {
  expect(CategorySchema.options).toContain("ACADEMIC");
  expect(ApiErrorSchema.parse({ error: "Not found" })).toEqual({ error: "Not found" });
});
