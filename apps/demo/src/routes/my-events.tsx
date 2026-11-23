import { createFileRoute, Link } from "@tanstack/react-router";
import { EyeOff } from "lucide-react";
import { AppShell, PageLoading, SignInPrompt } from "@/components/AppShell";
import { EventCard } from "@/components/EventBits";
import { ScheduleEditor } from "@/components/ScheduleEditor";
import { useAuth } from "@/lib/auth";
import { actions, useDemo } from "@/lib/demo/store";
import { upcomingEvents } from "@/lib/demo/logic";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/my-events")({
  head: () => ({
    meta: [
      { title: "My Events — Engage+" },
      { name: "description", content: "The Howard events you've RSVP'd to." },
      { property: "og:title", content: "My Events — Engage+" },
      { property: "og:description", content: "The Howard events you've RSVP'd to." },
    ],
  }),
  component: MyEvents,
});

function MyEvents() {
  const s = useDemo();
  const { user, loading } = useAuth();
  if (loading)
    return (
      <AppShell>
        <PageLoading />
      </AppShell>
    );
  if (!user)
    return (
      <AppShell>
        <SignInPrompt message="Sign in to see the events you're going to." />
      </AppShell>
    );

  const going = s.rsvps[user.id] ?? [];
  const mine = upcomingEvents(s).filter((e) => going.includes(e.id));
  const hidden = !!s.hideRsvps[user.id];

  return (
    <AppShell>
      <h1 className="mb-5 font-display text-4xl font-extrabold">My Events</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="grid content-start gap-3">
          {mine.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
          {mine.length === 0 && (
            <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              No RSVPs yet.{" "}
              <Link to="/swipe" className="text-accent underline">
                Swipe through events
              </Link>
            </p>
          )}
        </div>
        <div className="space-y-6">
          <section className="rounded-3xl border bg-card p-6 shadow-card">
            <label className="flex items-start gap-3">
              <Switch
                checked={hidden}
                onCheckedChange={(v) => actions.setHideRsvps(v)}
                aria-label="Hide my RSVPs from friends"
              />
              <span>
                <span className="flex items-center gap-1 font-semibold">
                  <EyeOff className="size-4" /> Hide my RSVPs
                </span>
                <span className="block text-sm text-muted-foreground">
                  {hidden
                    ? "Friends can't see which events you're going to."
                    : "Friends can see the events you're going to."}
                </span>
              </span>
            </label>
          </section>
          <ScheduleEditor classes={s.classes[user.id] ?? []} />
        </div>
      </div>
    </AppShell>
  );
}
