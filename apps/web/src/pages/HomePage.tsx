// Placeholder landing page (TR1). Shows the API connection so TC-52 can be checked by eye.
// PF replaces this with the quiz / swipe feed entry point (F1, F2).
import { getHealth } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { ErrorState, LoadingState } from "../components/Status";

export function HomePage() {
  const health = useAsync(getHealth);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find your people on campus.</h1>
        <p className="mt-2 text-slate-600">
          Swipe through events and student orgs. Right to RSVP or follow, left to skip.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">System status</h2>
        {health.status === "loading" && <LoadingState label="Connecting to the API…" />}
        {health.status === "error" && <ErrorState message={health.message} onRetry={health.retry} />}
        {health.status === "success" && (
          <p className="mt-2 flex items-center gap-2 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
            API online
          </p>
        )}
      </div>
    </section>
  );
}
