import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EventCard } from "@/components/EventBits";
import { CATEGORIES, eventsQuery, filterEvents } from "@/lib/data";
import { Input } from "@/components/ui/input";
import hero from "@/assets/hero-yard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Engage+ — Discover Howard campus events" },
      { name: "description", content: "Browse, search and filter Howard University events, RSVP and follow student organizations." },
      { property: "og:title", content: "Engage+ — Discover Howard campus events" },
      { property: "og:description", content: "Find exactly the Howard events you want, RSVP in a tap, and follow the orgs you love." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  component: Discover,
});

function Discover() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const shown = filterEvents(events, search, category);

  return (
    <AppShell>
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground md:p-10">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity" />
        <div className="relative max-w-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest opacity-80">The Mecca, this week</p>
          <h1 className="font-display text-4xl font-extrabold leading-none md:text-6xl">Find your people. Show up.</h1>
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
        </div>
      </section>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {[null, ...CATEGORIES].map((c) => (
          <button
            key={c ?? "all"}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
              category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            }`}
          >
            {c ?? "All events"}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {shown.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
        {shown.length === 0 && (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No events match. Try another search or category.</p>
        )}
      </div>
    </AppShell>
  );
}
