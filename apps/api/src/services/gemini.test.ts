import { createGeminiModel, DEFAULT_GEMINI_MODEL, GeminiError, geminiFromEnv } from "./gemini.js";

interface Call {
  url: string;
  init: RequestInit;
}

function fakeFetch(responses: Response[]) {
  const calls: Call[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (!next) throw new Error("no more fake responses");
    return next;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const geminiBody = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });

const schema = { type: "OBJECT", properties: {} };

test("TC-27 Gemini call forces JSON output and keeps the key out of the URL", async () => {
  const { impl, calls } = fakeFetch([geminiBody('{"title":"Mixer"}')]);
  const model = createGeminiModel({ apiKey: "secret-key", model: "gemini-test", fetchImpl: impl });

  await expect(model.generateJson("prompt", schema)).resolves.toEqual({ title: "Mixer" });
  const call = calls[0];
  expect(call?.url).toContain("/models/gemini-test:generateContent");
  expect(call?.url).not.toContain("secret-key");
  expect((call?.init.headers as Record<string, string>)["x-goog-api-key"]).toBe("secret-key");
  const body = JSON.parse(String(call?.init.body)) as { generationConfig: Record<string, unknown> };
  expect(body.generationConfig.responseMimeType).toBe("application/json");
  expect(body.generationConfig.responseSchema).toEqual(schema);
});

test("TC-27 Gemini retries once on rate limit, then succeeds", async () => {
  const { impl, calls } = fakeFetch([new Response("{}", { status: 429 }), geminiBody("{}")]);
  const model = createGeminiModel({ apiKey: "k", model: "m", fetchImpl: impl, retryDelayMs: 0 });
  await expect(model.generateJson("p", schema)).resolves.toEqual({});
  expect(calls).toHaveLength(2);
});

test("TC-27 Gemini errors and bad JSON throw GeminiError", async () => {
  const bad = fakeFetch([new Response("{}", { status: 400 })]);
  await expect(
    createGeminiModel({ apiKey: "k", model: "m", fetchImpl: bad.impl }).generateJson("p", schema),
  ).rejects.toBeInstanceOf(GeminiError);

  const notJson = fakeFetch([geminiBody("not json")]);
  await expect(
    createGeminiModel({ apiKey: "k", model: "m", fetchImpl: notJson.impl }).generateJson("p", schema),
  ).rejects.toThrow("invalid JSON");

  const empty = fakeFetch([new Response(JSON.stringify({ candidates: [] }), { status: 200 })]);
  await expect(
    createGeminiModel({ apiKey: "k", model: "m", fetchImpl: empty.impl }).generateJson("p", schema),
  ).rejects.toThrow("no content");
});

test("TC-27 no GEMINI_API_KEY means no model (fallback only)", () => {
  expect(geminiFromEnv({})).toBeNull();
  expect(geminiFromEnv({ GEMINI_API_KEY: "  " })).toBeNull();
  expect(geminiFromEnv({ GEMINI_API_KEY: "k" })).not.toBeNull();
  expect(DEFAULT_GEMINI_MODEL).toMatch(/^gemini-/);
});
