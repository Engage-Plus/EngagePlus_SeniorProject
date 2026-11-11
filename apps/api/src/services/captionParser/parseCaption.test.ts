// TC-27 with Gemini mocked (CLAUDE.md rule 6): CI never calls the real API.
import { ParseCaptionResponseSchema } from "@engageplus/shared";
import type { JsonModel } from "../gemini.js";
import { AI_UNAVAILABLE_WARNING, parseCaption } from "./index.js";
import { CAREER_CAPTION, NOW, VAGUE_CAPTION } from "./fixtures.js";

function fakeModel(output: unknown | (() => Promise<unknown>)) {
  const prompts: string[] = [];
  const model: JsonModel = {
    async generateJson(prompt) {
      prompts.push(prompt);
      return typeof output === "function" ? (output as () => Promise<unknown>)() : output;
    },
  };
  return { model, prompts };
}

const now = () => NOW;

beforeEach(() => jest.spyOn(console, "warn").mockImplementation(() => undefined));
afterEach(() => jest.restoreAllMocks());

test("TC-27 sample captions return title, date, time, location and category as JSON", async () => {
  const { model } = fakeModel({
    title: "Fall Career Fair Prep Workshop",
    description: "Resume reviews and mock interviews before the career fair.",
    category: "PROFESSIONAL",
    location: "Blackburn Center Ballroom",
    date: "2026-11-13",
    startTime: "18:00",
    endTime: "20:00",
  });
  const res = await parseCaption(CAREER_CAPTION, { model, now });

  expect(ParseCaptionResponseSchema.parse(res)).toEqual(res); // valid JSON contract
  expect(res.source).toBe("ai");
  expect(res.warnings).toEqual([]);
  expect(res.fields).toEqual({
    title: "Fall Career Fair Prep Workshop",
    description: "Resume reviews and mock interviews before the career fair.",
    category: "PROFESSIONAL",
    location: "Blackburn Center Ballroom",
    date: "2026-11-13",
    startTime: "18:00",
    endTime: "20:00",
    startsAt: "2026-11-13T23:00:00.000Z",
    endsAt: "2026-11-14T01:00:00.000Z",
  });
});

test("TC-27 missing fields are null", async () => {
  const { model } = fakeModel({
    title: "Just vibes",
    description: null,
    category: null,
    location: null,
    date: null,
    startTime: null,
    endTime: null,
  });
  const res = await parseCaption(VAGUE_CAPTION, { model, now });
  expect(res.source).toBe("ai");
  expect(res.fields).toEqual({
    title: "Just vibes",
    description: null,
    category: null,
    location: null,
    date: null,
    startTime: null,
    endTime: null,
    startsAt: null,
    endsAt: null,
  });
  expect(res.warnings).toEqual(["No date found. Please add one.", "No start time found. Please add one."]);
});

test("TC-27 invalid AI values are dropped to null, not trusted", async () => {
  const { model } = fakeModel({
    title: "  Mixer  ",
    category: "party",
    date: "2026-02-30",
    startTime: "7pm",
    endTime: "25:00",
  });
  const res = await parseCaption("Mixer", { model, now });
  expect(res.source).toBe("ai");
  expect(res.fields).toMatchObject({ title: "Mixer", category: null, date: null, startTime: null, endTime: null });
  expect(res.warnings).toContain("Couldn't read the date. Please enter it.");
});

test.each([
  ["throws", () => Promise.reject(new Error("429 quota"))],
  ["returns the wrong shape", () => Promise.resolve(["not", "an", "object"])],
])("TC-27 falls back to the basic parser when Gemini %s", async (_label, output) => {
  const { model } = fakeModel(output);
  const res = await parseCaption(CAREER_CAPTION, { model, now });
  expect(res.source).toBe("fallback");
  expect(res.warnings[0]).toBe(AI_UNAVAILABLE_WARNING);
  expect(res.fields).toMatchObject({ title: "Fall Career Fair Prep Workshop", date: "2026-11-13" });
});

test("TC-27 no Gemini key uses the fallback without an outage warning", async () => {
  const res = await parseCaption(CAREER_CAPTION, { model: null, now });
  expect(res.source).toBe("fallback");
  expect(res.warnings).not.toContain(AI_UNAVAILABLE_WARNING);
  expect(res.fields.startsAt).toBe("2026-11-13T23:00:00.000Z");
});

test("TC-27 prompt gives today's New York date and strips contact details", async () => {
  const { model, prompts } = fakeModel({});
  await parseCaption(CAREER_CAPTION, { model, now });
  const prompt = prompts[0] ?? "";
  expect(prompt).toContain("Today is Wednesday, 2026-11-11");
  expect(prompt).toContain("Fall Career Fair Prep Workshop");
  expect(prompt).not.toContain("prez@example.org");
  expect(prompt).not.toContain("202-555-0142");
  expect(prompt).toContain("[email]");
});

test("TC-27 past dates are flagged for review", async () => {
  const { model } = fakeModel({ title: "Old event", date: "2026-10-01", startTime: "18:00" });
  const res = await parseCaption("Old event", { model, now });
  expect(res.warnings).toContain("The date looks like it's in the past. Please check it.");
});
