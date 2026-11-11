// Chat assistant page (F16_01, TC-34). Free-text question -> matching upcoming events.
import { useState, type FormEvent } from "react";
import { CHAT_MESSAGE_MAX_LENGTH, type ChatResponse } from "@engageplus/shared";
import { askChat } from "../lib/api";
import { ChatResultCard } from "../components/ChatResultCard";
import { ErrorState, LoadingState } from "../components/Status";

type State =
  | { status: "idle" }
  | { status: "loading"; question: string }
  | { status: "error"; question: string; message: string }
  | { status: "success"; question: string; data: ChatResponse };

const EXAMPLES = ["What's happening this afternoon?", "Any career events this week?", "Something fun tonight"];

export function ChatPage() {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    setState({ status: "loading", question: q });
    try {
      setState({ status: "success", question: q, data: await askChat({ message: q }) });
    } catch (err) {
      setState({ status: "error", question: q, message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(message);
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ask Engage+</h1>
        <p className="mt-1 text-slate-600">Ask about campus events in your own words.</p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <label htmlFor="chat-message" className="sr-only">
          Your question
        </label>
        <input
          id="chat-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          placeholder="e.g. anything this afternoon?"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-base focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
        />
        <button
          type="submit"
          disabled={!message.trim() || state.status === "loading"}
          className="min-h-11 shrink-0 rounded-xl bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Ask
        </button>
      </form>

      {state.status === "idle" && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setMessage(q);
                void ask(q);
              }}
              className="min-h-11 rounded-full border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:border-brand-600"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {state.status === "loading" && <LoadingState label="Finding events…" />}
      {state.status === "error" && <ErrorState message={state.message} onRetry={() => void ask(state.question)} />}
      {state.status === "success" && (
        <div className="space-y-3">
          <p className="text-slate-800">{state.data.reply}</p>
          {state.data.results.length > 0 ? (
            <ul className="space-y-3">
              {state.data.results.map((event) => (
                <ChatResultCard key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              No matching events. Try another time or different words.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
