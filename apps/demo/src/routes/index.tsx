import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Layers, Search, Sparkles } from "lucide-react";
import { AppShell, PageLoading } from "@/components/AppShell";
import { CategoryPill, EventCard } from "@/components/EventBits";
import { CATEGORIES, filterEvents, formatWhen } from "@/lib/data";
import { useDemo } from "@/lib/demo/store";
import { conflictingClass, rsvpCount, trending, upcomingEvents } from "@/lib/demo/logic";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-yard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Engage+ — Discover Howard campus events" },
      {
        name: "description",
        content:
          "Browse, search and filter Howard University events, RSVP and follow student organizations.",
      },
      { property: "og:title", content: "Engage+ — Discover Howard campus events" },
      {
        property: "og:description",
        content:
          "Find exactly the Howard events you want, RSVP in a tap, and follow the orgs you love.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const s = useDemo();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [hideClashes, setHideClashes] = useState(true);
  const classes = s.userId ? (s.classes[s.userId] ?? []) : [];
  const all = upcomingEvents(s);
  const filtered = filterEvents(all, search, category);
  const shown = hideClashes ? filtered.filter((e) => !conflictingClass(e, classes)) : filtered;
  const hidden = filtered.length - shown.length;
  const hot = trending(s);
  const needsQuiz = s.userId && !(s.interests[s.userId] ?? []).length;

  return (
    <AppShell>
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground md:p-10">
        <img
          src={hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="relative max-w-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest opacity-80">
            The Mecca, this week
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-none md:text-6xl">
            Find your people. Show up.
          </h1>
          <div className="mt-6 flex items-center gap-2 rounded-full bg-card px-4 text-foreground">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by name…"
              className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
              aria-label="Search events"
            />
          </div>
          <Button asChild variant="bison" className="mt-4">
            <Link to="/swipe">
              <Layers /> Swipe through events
            </Link>
          </Button>
        </div>
      </section>

      {!s.ready ? (
        <PageLoading />
      ) : (
        <>
          {needsQuiz && (
            <Link
              to="/quiz"
              className="mb-6 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 hover:bg-accent/15"
            >
              <Sparkles className="size-5 shrink-0 text-accent" />
              <span className="text-sm">
                <b>New here?</b> Take the 30-second quiz and we'll match you with orgs.
              </span>
            </Link>
          )}

          {hot.length > 0 && !search && !category && (
            <section className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
                <Flame className="size-5 text-accent" /> Trending this week
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {hot.map((e, i) => (
                  <Link
                    key={e.id}
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <CategoryPill category={e.category} />
                      <span className="font-display text-2xl font-extrabold text-muted-foreground/40">
                        #{i + 1}
                      </span>
                    </div>
                    <p className="font-display font-bold leading-snug">{e.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatWhen(e.starts_at).day} · {rsvpCount(s, e.id)} going
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {[null, ...CATEGORIES].map((c) => (
              <button
                key={c ?? "all"}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {c ?? "All events"}
              </button>
            ))}
          </div>

          {classes.length > 0 && (
            <label className="mb-5 flex items-center gap-3 text-sm">
              <Switch
                checked={hideClashes}
                onCheckedChange={setHideClashes}
                aria-label="Hide events during my classes"
              />
              Hide events during my classes
              {hideClashes && hidden > 0 && (
                <span className="text-muted-foreground">({hidden} hidden)</span>
              )}
            </label>
          )}

          <div className="grid gap-3">
            {shown.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {shown.length === 0 && (
              <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                No events match. Try another search or category.
              </p>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
