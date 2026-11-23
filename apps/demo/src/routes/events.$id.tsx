import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, CalendarPlus, Clock, MapPin, TriangleAlert, Users } from "lucide-react";
import { AppShell, PageLoading } from "@/components/AppShell";
import { CategoryPill, FollowButton, FriendsGoing, RsvpButton } from "@/components/EventBits";
import { catGradient, formatWhen } from "@/lib/data";
import { actions, useDemo } from "@/lib/demo/store";
import { conflictingClass, rsvpCount, withOrg } from "@/lib/demo/logic";
import { downloadIcs } from "@/lib/demo/ics";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Event — Engage+" },
      { name: "description", content: "Howard campus event on Engage+" },
      { property: "og:title", content: "Event — Engage+" },
      { property: "og:description", content: "Howard campus event on Engage+" },
    ],
  }),
  component: EventPage,
});

function EventPage() {
  const { id } = Route.useParams();
  const s = useDemo();
  const raw = s.events.find((e) => e.id === id);

  useEffect(() => {
    if (s.ready && raw) actions.recordView(id);
    // Count one view per visit, not per re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.ready, id]);

  if (!s.ready)
    return (
      <AppShell>
        <PageLoading />
      </AppShell>
    );
  if (!raw)
    return (
      <AppShell>
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">
            This event isn't available. It may have ended or the demo data was reset.
          </p>
          <Button variant="bison" asChild>
            <Link to="/">Back to Discover</Link>
          </Button>
        </div>
      </AppShell>
    );

  const ev = withOrg(s, raw);
  const st = formatWhen(ev.starts_at);
  const en = ev.ends_at ? formatWhen(ev.ends_at) : null;
  const clash = s.userId ? conflictingClass(ev, s.classes[s.userId] ?? []) : null;

  return (
    <AppShell>
      <article className="overflow-hidden rounded-3xl border bg-card shadow-card">
        <div
          className={`bg-gradient-to-br p-8 text-primary-foreground ${catGradient[ev.category]}`}
        >
          <CategoryPill category={ev.category} />
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">{ev.title}</h1>
          {ev.organizations && (
            <Link
              to="/orgs/$id"
              params={{ id: ev.organizations.id }}
              className="mt-2 inline-block underline-offset-4 opacity-90 hover:underline"
            >
              Hosted by {ev.organizations.name}
            </Link>
          )}
        </div>
        <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-accent" /> {st.day}, {st.date}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-accent" /> {st.time}
              {en ? ` – ${en.time}` : ""}{" "}
              <span className="text-xs text-muted-foreground">(ET)</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> {ev.location}
            </p>
            <p className="flex items-center gap-2">
              <Users className="size-4 text-accent" /> {rsvpCount(s, ev.id)} going
            </p>
            <FriendsGoing eventId={ev.id} />
            {clash && (
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <TriangleAlert className="size-4" /> Overlaps your class {clash.name}
              </p>
            )}
            <p className="pt-3 leading-relaxed text-muted-foreground">{ev.description}</p>
            <p className="text-sm font-medium">{ev.is_free ? "Free entry" : "Paid entry"}</p>
          </div>
          <div className="flex flex-col gap-3">
            <RsvpButton eventId={ev.id} />
            {ev.organizations && <FollowButton orgId={ev.organizations.id} />}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => downloadIcs(ev)}
            >
              <CalendarPlus /> Add to calendar
            </Button>
          </div>
        </div>
      </article>
    </AppShell>
  );
}
