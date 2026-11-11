// Caption parser (F14_01, TC-27): Gemini first, basic parser as fallback.
// Result is a *draft*: the org reviews every field before publishing (US-6.3).
import type { ParseCaptionResponse } from "@engageplus/shared";
import type { JsonModel } from "../gemini.js";
import { CAPTION_RESPONSE_SCHEMA, buildCaptionPrompt, sanitizeAiOutput } from "./ai.js";
import { fallbackParse } from "./fallback.js";
import { toParsedFields } from "./normalize.js";

export interface CaptionParserDeps {
  /** null = no Gemini key configured; go straight to the fallback. */
  model: JsonModel | null;
  now?: () => Date;
}

export const AI_UNAVAILABLE_WARNING =
  "AI parsing was unavailable, so a basic parser filled these in. Please double-check every field.";

export async function parseCaption(
  caption: string,
  deps: CaptionParserDeps,
): Promise<ParseCaptionResponse> {
  const now = deps.now?.() ?? new Date();

  if (deps.model) {
    try {
      const raw = await deps.model.generateJson(buildCaptionPrompt(caption, now), CAPTION_RESPONSE_SCHEMA);
      const ai = sanitizeAiOutput(raw);
      if (ai) {
        const { fields, warnings } = toParsedFields(ai.fields, now);
        return { fields, source: "ai", warnings: [...ai.warnings, ...warnings] };
      }
      console.warn("caption parser: AI output failed validation, using fallback");
    } catch (err) {
      console.warn("caption parser: AI call failed, using fallback:", err instanceof Error ? err.message : err);
    }
  }

  const { fields, warnings } = toParsedFields(fallbackParse(caption, now), now);
  return {
    fields,
    source: "fallback",
    warnings: deps.model ? [AI_UNAVAILABLE_WARNING, ...warnings] : warnings,
  };
}
