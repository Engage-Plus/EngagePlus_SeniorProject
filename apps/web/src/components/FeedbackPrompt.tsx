// Thumbs up/down prompt after an RSVP'd event ends (F5_01, TC-05).
// A side widget: while loading, or if the user isn't signed in, it renders nothing so it
// never blocks the page. Submit errors show inline with a retry. PF: keep it on the feed page.
import { useCallback, useState } from "react";
import { getPendingFeedback, sendFeedback } from "../lib/api";
import { formatEventTime } from "../lib/format";
import { useAsync } from "../lib/useAsync";

export function FeedbackPrompt() {
  const pending = useAsync(useCallback(() => getPendingFeedback(), []));
  const [done, setDone] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);

  if (pending.status !== "success") return null;
  const event = pending.data.events.find((e) => !done.includes(e.id));
  if (!event) {
    return thanks ? (
      <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
        Thanks! Your feedback helps us recommend better events.
      </p>
    ) : null;
  }

  async function rate(thumbsUp: boolean) {
    if (!event) return;
    setSaving(true);
    setError(null);
    try {
      await sendFeedback(event.id, thumbsUp);
      setDone((d) => [...d, event.id]);
      setThanks(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your rating.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside aria-label="Event feedback" className="rounded-2xl border border-brand-600/20 bg-brand-50 p-4">
      <p className="text-sm text-slate-600">You RSVP&apos;d to</p>
      <p className="font-semibold">{event.title}</p>
      <p className="text-sm text-slate-500">
        {event.orgName} · {formatEventTime(event.startsAt)}
      </p>
      <p className="mt-3 font-medium">How was it?</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void rate(true)}
          aria-label="Thumbs up"
          className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white text-xl hover:border-emerald-500 disabled:opacity-50"
        >
          👍
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void rate(false)}
          aria-label="Thumbs down"
          className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white text-xl hover:border-red-500 disabled:opacity-50"
        >
          👎
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error} Tap a thumb to try again.
        </p>
      )}
    </aside>
  );
}
