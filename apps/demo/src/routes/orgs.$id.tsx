import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CategoryPill, EventCard, FollowButton } from "@/components/EventBits";

const orgQuery = (id: string) =>
  queryOptions({
    queryKey: ["org", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*, events(*, organizations(id, name))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const Route = createFileRoute("/orgs/$id")({
  loader: async ({ context, params }) => {
    const o = await context.queryClient.ensureQueryData(orgQuery(params.id));
    if (!o) throw notFound();
    return o;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Organization"} — Engage+` },
      { name: "description", content: loaderData?.description ?? "Howard student organization" },
      { property: "og:title", content: `${loaderData?.name ?? "Organization"} — Engage+` },
      { property: "og:description", content: loaderData?.description ?? "Howard student organization" },
    ],
  }),
  component: OrgPage,
});

function OrgPage() {
  const { id } = Route.useParams();
  const { data: org } = useSuspenseQuery(orgQuery(id));
  if (!org) return null;
  const upcoming = [...org.events]
    .filter((e) => new Date(e.starts_at).getTime() > Date.now() - 6 * 3600e3)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return (
    <AppShell>
      <section className="mb-6 rounded-3xl bg-hero p-8 text-primary-foreground">
        <CategoryPill category={org.category} />
        <h1 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">{org.name}</h1>
        <p className="mt-3 max-w-2xl opacity-90">{org.description}</p>
        <div className="mt-5"><FollowButton orgId={org.id} /></div>
      </section>
      <h2 className="mb-3 font-display text-2xl font-bold">Upcoming events</h2>
      <div className="grid gap-3">
        {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
        {upcoming.length === 0 && <p className="text-muted-foreground">No upcoming events yet.</p>}
      </div>
    </AppShell>
  );
}
