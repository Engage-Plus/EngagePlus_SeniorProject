import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Heart, Lock, PlusCircle, Users } from "lucide-react";
import { AppShell, PageLoading, SignInPrompt } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { formatWhen } from "@/lib/data";
import { useDemo } from "@/lib/demo/store";
import { canManage, orgAnalytics } from "@/lib/demo/logic";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Org dashboard — Engage+" },
      { name: "description", content: "Views, swipes and RSVPs for your organization's events." },
      { property: "og:title", content: "Org dashboard — Engage+" },
      { property: "og:description", content: "Analytics for org managers." },
    ],
  }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function Dashboard() {
  const s = useDemo();
  const { user, loading } = useAuth();
  const [orgId, setOrgId] = useState("");
  if (loading)
    return (
      <AppShell>
        <PageLoading />
      </AppShell>
    );
  if (!user)
    return (
      <AppShell>
        <SignInPrompt message="Sign in as an org manager to see analytics." />
      </AppShell>
    );

  const managed = s.orgs.filter((o) => canManage(user, o));
  const org = managed.find((o) => o.id === orgId) ?? managed[0];
  // Analytics are manager-only (NFR3); a student sees this instead of the numbers.
  if (!org)
    return (
      <AppShell>
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <Lock className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">
            Analytics are only visible to an organization's managers.
          </p>
          <Button variant="bison" asChild>
            <Link to="/">Back to Discover</Link>
          </Button>
        </div>
      </AppShell>
    );

  const { followers, events } = orgAnalytics(s, org.id);
  const totals = events.reduce(
    (t, e) => ({
      views: t.views + e.views,
      rsvps: t.rsvps + e.rsvps,
      swipes: t.swipes + e.swipeRights,
    }),
    { views: 0, rsvps: 0, swipes: 0 },
  );
  const max = Math.max(1, ...events.map((e) => e.views));

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Org dashboard
          </p>
          {managed.length > 1 ? (
            <select
              value={org.id}
              onChange={(e) => setOrgId(e.target.value)}
              className="rounded-md border bg-card px-2 py-1 font-display text-2xl font-extrabold"
              aria-label="Organization"
            >
              {managed.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          ) : (
            <h1 className="font-display text-4xl font-extrabold">{org.name}</h1>
          )}
        </div>
        <Button variant="bison" asChild>
          <Link to="/create">
            <PlusCircle /> Post an event
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Users} label="Followers" value={followers.toLocaleString()} />
        <Stat icon={Eye} label="Event views" value={totals.views.toLocaleString()} />
        <Stat icon={Heart} label="Swipe rights" value={totals.swipes.toLocaleString()} />
        <Stat icon={Users} label="RSVPs" value={totals.rsvps.toLocaleString()} />
      </div>

      <section className="rounded-3xl border bg-card p-6 shadow-card">
        <h2 className="mb-1 font-display text-xl font-bold">Event funnel</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Views → swipe rights → RSVPs for each event. Counts are anonymous; no student names are
          shown.
        </p>
        <div className="space-y-5">
          {events.map(({ event, views, swipeRights, rsvps, conversion }) => (
            <div key={event.id}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  to="/events/$id"
                  params={{ id: event.id }}
                  className="font-semibold hover:text-accent"
                >
                  {event.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatWhen(event.starts_at).date} · {(conversion * 100).toFixed(0)}% of viewers
                  RSVP'd
                </span>
              </div>
              {[
                { label: "Views", value: views, cls: "bg-primary/25" },
                { label: "Swipe rights", value: swipeRights, cls: "bg-primary/60" },
                { label: "RSVPs", value: rsvps, cls: "bg-accent" },
              ].map((b) => (
                <div key={b.label} className="mb-1 flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-muted-foreground">{b.label}</span>
                  <div className="h-3 flex-1 rounded-full bg-muted">
                    <div
                      className={`h-3 rounded-full ${b.cls}`}
                      style={{ width: `${(b.value / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium tabular-nums">{b.value}</span>
                </div>
              ))}
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No events yet. Post one to start seeing numbers.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
