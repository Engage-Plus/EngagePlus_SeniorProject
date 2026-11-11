// One chat result: event basics + the one-line reason (TC-35).
// PF (F2_05): add the RSVP button here; it should POST /events/:id/swipe {action: "RIGHT"}.
import type { ChatEventResult } from "@engageplus/shared";
import { formatEventTime, titleCase } from "../lib/format";

export function ChatResultCard({ event }: { event: ChatEventResult }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug">{event.title}</h3>
        <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
          {titleCase(event.category)}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {formatEventTime(event.startsAt)}
        {event.location ? ` · ${event.location}` : ""}
      </p>
      <p className="text-sm text-slate-500">{event.orgName}</p>
      <p className="mt-2 text-sm text-slate-800">
        <span className="font-medium text-brand-700">Why: </span>
        {event.reason}
      </p>
    </li>
  );
}
