// Thin Gemini REST client (DM). JSON-only output, one retry on 429/5xx (risk H3).
// Injected as `JsonModel` everywhere so tests and CI never call the real API.
import { z } from "zod";

export interface JsonModel {
  /** Sends `prompt`, forces a JSON response matching `responseSchema`, returns the parsed JSON. */
  generateJson(prompt: string, responseSchema: Record<string, unknown>): Promise<unknown>;
}

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiOptions {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retryDelayMs?: number;
}

const GeminiResponse = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({ parts: z.array(z.object({ text: z.string().optional() })) }),
      }),
    )
    .min(1),
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createGeminiModel(opts: GeminiOptions): JsonModel {
  const doFetch = opts.fetchImpl ?? fetch;
  const url = `${BASE_URL}/${encodeURIComponent(opts.model)}:generateContent`;

  const send = (prompt: string, responseSchema: Record<string, unknown>) =>
    doFetch(url, {
      method: "POST",
      // Key in a header, never in the URL, so it can't leak into logs.
      headers: { "Content-Type": "application/json", "x-goog-api-key": opts.apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0 },
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
    });

  return {
    async generateJson(prompt, responseSchema) {
      let res = await send(prompt, responseSchema);
      if (res.status === 429 || res.status >= 500) {
        await sleep(opts.retryDelayMs ?? 800);
        res = await send(prompt, responseSchema);
      }
      if (!res.ok) throw new GeminiError(`Gemini request failed (${res.status})`);

      const body = GeminiResponse.safeParse(await res.json().catch(() => null));
      const text = body.success ? body.data.candidates[0]?.content.parts[0]?.text : undefined;
      if (!text) throw new GeminiError("Gemini returned no content");
      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new GeminiError("Gemini returned invalid JSON");
      }
    },
  };
}

/** Returns null when no key is configured, so callers use their non-AI fallback. */
export function geminiFromEnv(env: NodeJS.ProcessEnv = process.env): JsonModel | null {
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return createGeminiModel({ apiKey, model: env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL });
}
