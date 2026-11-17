import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CategoryPill, FollowButton, RsvpButton } from "@/components/EventBits";
import { formatWhen } from "@/lib/data";

const eventQuery = (id: string) =>
  queryOptions({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*, organizations(id, name)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const Route = createFileRoute("/events/$id")({
  loader: async ({ context, params }) => {
    const ev = await context.queryClient.ensureQueryData(eventQuery(params.id));
    if (!ev) throw notFound();
    return ev;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Event"} — Engage+` },
      { name: "description", content: loaderData?.description ?? "Howard campus event" },
      { property: "og:title", content: `${loaderData?.title ?? "Event"} — Engage+` },
      { property: "og:description", content: loaderData?.description ?? "Howard campus event" },
    ],
  }),
  component: EventPage,
});

function EventPage() {
  const { id } = Route.useParams();
  const { data: ev } = useSuspenseQuery(eventQuery(id));
  if (!ev) return null;
  const s = formatWhen(ev.starts_at);
  const e = ev.ends_at ? formatWhen(ev.ends_at) : null;
  return (
    <AppShell>
      <article className="overflow-hidden rounded-3xl border bg-card shadow-card">
        <div className="bg-hero p-8 text-primary-foreground">
          <CategoryPill category={ev.category} />
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">{ev.title}</h1>
          {ev.organizations && (
            <Link to="/orgs/$id" params={{ id: ev.organizations.id }} className="mt-2 inline-block underline-offset-4 opacity-90 hover:underline">
              Hosted by {ev.organizations.name}
            </Link>
          )}
        </div>
        <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="flex items-center gap-2"><CalendarDays className="size-4 text-accent" /> {s.day}, {s.date}</p>
            <p className="flex items-center gap-2"><Clock className="size-4 text-accent" /> {s.time}{e ? ` – ${e.time}` : ""}</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-accent" /> {ev.location}</p>
            <p className="pt-3 leading-relaxed text-muted-foreground">{ev.description}</p>
            <p className="text-sm font-medium">{ev.is_free ? "Free entry" : "Paid entry"}</p>
          </div>
          <div className="flex flex-col gap-3">
            <RsvpButton eventId={ev.id} />
            {ev.organizations && <FollowButton orgId={ev.organizations.id} />}
          </div>
        </div>
      </article>
    </AppShell>
  );
}
