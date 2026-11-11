// Chat assistant pipeline (F16, architecture.md "Chat"): parse time words server-side ->
// retrieve candidate events from the DB -> Gemini picks ids + reasons -> keyword fallback.
import type { ChatEventResult, ChatResponse } from "@engageplus/shared";
import type { JsonModel } from "../gemini.js";
import { buildChatPrompt, CHAT_RESPONSE_SCHEMA, MAX_RESULTS, sanitizeChatOutput } from "./ai.js";
import { describeWhen, keywordPicks } from "./keywordMatch.js";
import { inWindow, parseTimeWindow, type TimeWindow } from "./timeWords.js";
import type { CandidateSource, ChatCandidate, Pick } from "./types.js";

export type { CandidateSource, ChatCandidate } from "./types.js";

/** With no time words, look this far ahead. */
export const DEFAULT_HORIZON_DAYS = 14;

export interface ChatDeps {
  loadCandidates: CandidateSource;
  model: JsonModel | null;
  now?: () => Date;
}

function toResult({ event, reason }: Pick): ChatEventResult {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    location: event.location,
    orgName: event.orgName,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    reason,
  };
}

function fallbackReply(picks: readonly Pick[], window: TimeWindow | null): string {
  const when = window ? ` ${window.label}` : "";
  if (picks.length === 0) return `I couldn't find any matching events${when}. Try different words or another time.`;
  return `Here ${picks.length === 1 ? "is 1 event" : `are ${picks.length} events`}${when} that might fit.`;
}

export async function answerChat(message: string, deps: ChatDeps): Promise<ChatResponse> {
  const now = deps.now?.() ?? new Date();
  const window = parseTimeWindow(message, now);
  const range = window ?? {
    from: now,
    to: new Date(now.getTime() + DEFAULT_HORIZON_DAYS * 24 * 60 * 60 * 1000),
  };

  const loaded = await deps.loadCandidates({ from: range.from, to: range.to });
  // Re-check in code: only upcoming events, and only inside the window (TC-34, TC-36).
  const candidates: ChatCandidate[] = loaded.filter(
    (e) => e.endsAt > now && (window ? inWindow(e, window) : e.startsAt < range.to),
  );
  const windowOut = window
    ? { label: window.label, from: window.from.toISOString(), to: window.to.toISOString() }
    : null;

  if (deps.model && candidates.length > 0) {
    try {
      const raw = await deps.model.generateJson(buildChatPrompt(message, candidates, window, now), CHAT_RESPONSE_SCHEMA);
      const ai = sanitizeChatOutput(raw, candidates, (e) => describeWhen(e, window));
      if (ai) {
        const reply = ai.reply || fallbackReply(ai.picks, window);
        return { reply, window: windowOut, results: ai.picks.map(toResult), source: "ai" };
      }
      console.warn("chat: AI output failed validation, using keyword fallback");
    } catch (err) {
      console.warn("chat: AI call failed, using keyword fallback:", err instanceof Error ? err.message : err);
    }
  }

  const picks = keywordPicks(message, candidates, window, MAX_RESULTS);
  return { reply: fallbackReply(picks, window), window: windowOut, results: picks.map(toResult), source: "fallback" };
}
