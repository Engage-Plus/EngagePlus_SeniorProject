import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { EventCard } from "@/components/EventBits";
import { useAuth } from "@/lib/auth";
import { eventsQuery, myRsvpsQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";

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
  const { user, loading } = useAuth();
  const { data: events } = useQuery(eventsQuery);
  const { data: rsvps } = useQuery(myRsvpsQuery(user?.id));
  const mine = (events ?? []).filter((e) => rsvps?.has(e.id));
  return (
    <AppShell>
      <h1 className="mb-5 font-display text-4xl font-extrabold">My Events</h1>
      {!loading && !user ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">Sign in to see the events you're going to.</p>
          <Button variant="bison" asChild><Link to="/login">Sign in</Link></Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {mine.map((e) => <EventCard key={e.id} event={e} />)}
          {rsvps && mine.length === 0 && (
            <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              No RSVPs yet. <Link to="/" className="text-accent underline">Discover events</Link>
            </p>
          )}
        </div>
      )}
    </AppShell>
  );
}
