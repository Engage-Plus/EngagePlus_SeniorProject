// TC-34–36 with Gemini mocked (CLAUDE.md rule 6).
import { ChatResponseSchema } from "@engageplus/shared";
import type { JsonModel } from "../gemini.js";
import { answerChat } from "./index.js";
import { EVENTS, everything, NOW } from "./fixtures.js";

const now = () => NOW;
const ids = (r: { results: { id: string }[] }) => r.results.map((e) => e.id);

function fakeModel(output: unknown) {
  const prompts: string[] = [];
  const generateJson = jest.fn(async (prompt: string) => {
    prompts.push(prompt);
    if (output instanceof Error) throw output;
    return output;
  });
  const model: JsonModel = { generateJson };
  return { model, prompts, generateJson };
}

beforeEach(() => jest.spyOn(console, "warn").mockImplementation(() => undefined));
afterEach(() => jest.restoreAllMocks());

test("TC-34 a typed question returns matching upcoming events", async () => {
  const res = await answerChat("any career events?", { loadCandidates: everything, model: null, now });
  expect(ChatResponseSchema.parse(res)).toEqual(res);
  expect(res.source).toBe("fallback");
  expect(ids(res)).toEqual(["lunch", "fair", "resume"]);
  expect(res.results.every((e) => e.category === "PROFESSIONAL")).toBe(true);
  expect(ids(res)).not.toContain("past");
});

test("TC-35 every result shows a reason", async () => {
  for (const q of ["career stuff", "what's on this weekend", "anything fun tonight?"]) {
    const res = await answerChat(q, { loadCandidates: everything, model: null, now });
    expect(res.results.length).toBeGreaterThan(0);
    for (const r of res.results) expect(r.reason.trim().length).toBeGreaterThan(0);
  }
});

test("TC-36 'this afternoon' returns only same-day afternoon events", async () => {
  const res = await answerChat("What's happening this afternoon?", { loadCandidates: everything, model: null, now });
  expect(res.window?.label).toBe("this afternoon");
  expect(ids(res).sort()).toEqual(["openmic", "resume"]);
  for (const r of res.results) {
    const hourNy = Number(
      new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hourCycle: "h23" }).format(
        new Date(r.startsAt),
      ),
    );
    expect(hourNy).toBeGreaterThanOrEqual(12);
    expect(hourNy).toBeLessThan(17);
  }
});

test("TC-36 'now' includes events already in progress", async () => {
  const res = await answerChat("anything going on now?", { loadCandidates: everything, model: null, now });
  expect(ids(res)).toEqual(["lunch", "resume"]);
});

test("TC-35 AI picks keep only real ids and always carry a reason", async () => {
  const { model, prompts } = fakeModel({
    reply: "Two good options this afternoon.",
    picks: [
      { id: "openmic", reason: "Live poetry, matches your vibe" },
      { id: "made-up", reason: "Does not exist" },
      { id: "games", reason: "Outside the window, must be dropped" },
      { id: "resume", reason: "   " },
      { id: "openmic", reason: "duplicate" },
    ],
  });
  const res = await answerChat("this afternoon, email me at a@b.edu", { loadCandidates: everything, model, now });

  expect(res.source).toBe("ai");
  expect(res.reply).toBe("Two good options this afternoon.");
  expect(ids(res)).toEqual(["openmic", "resume"]);
  expect(res.results[0]?.reason).toBe("Live poetry, matches your vibe");
  expect(res.results[1]?.reason).toMatch(/^Happening this afternoon/);
  expect(prompts[0]).toContain("The student means: this afternoon");
  expect(prompts[0]).not.toContain("a@b.edu");
  expect(prompts[0]).not.toContain('"id":"games"'); // only in-window candidates are sent
});

test.each([
  ["throws", new Error("quota")],
  ["returns junk", { answer: 42 }],
])("TC-34 falls back to keyword matching when AI %s", async (_label, output) => {
  const { model } = fakeModel(output);
  const res = await answerChat("career", { loadCandidates: everything, model, now });
  expect(res.source).toBe("fallback");
  expect(ids(res)).toContain("fair");
});

test("TC-34 no candidates: AI is not called and the reply says so", async () => {
  const { model, generateJson } = fakeModel({ reply: "x", picks: [] });
  const res = await answerChat("anything this morning?", { loadCandidates: everything, model, now });
  expect(generateJson).not.toHaveBeenCalled();
  expect(res.results).toEqual([]);
  expect(res.reply).toMatch(/couldn't find/i);
});

test("TC-34 results never exceed 5 and never include past events", async () => {
  const fair = EVENTS.find((e) => e.id === "fair");
  if (!fair) throw new Error("fixture missing");
  const many = Array.from({ length: 12 }, (_, i) => ({ ...fair, id: `fair${i}` }));
  const res = await answerChat("career fair", { loadCandidates: async () => [...EVENTS, ...many], model: null, now });
  expect(res.results).toHaveLength(5);
  expect(ids(res)).not.toContain("past");
});
