import { createFileRoute, Link } from "@tanstack/react-router";
import { AtSign, BadgeCheck } from "lucide-react";
import { AppShell, PageLoading } from "@/components/AppShell";
import { CategoryPill, EventCard, FollowButton } from "@/components/EventBits";
import { useDemo } from "@/lib/demo/store";
import { followerCount, upcomingEvents } from "@/lib/demo/logic";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orgs/$id")({
  head: () => ({
    meta: [
      { title: "Organization — Engage+" },
      { name: "description", content: "Howard student organization on Engage+" },
      { property: "og:title", content: "Organization — Engage+" },
      { property: "og:description", content: "Howard student organization on Engage+" },
    ],
  }),
  component: OrgPage,
});

function OrgPage() {
  const { id } = Route.useParams();
  const s = useDemo();
  if (!s.ready)
    return (
      <AppShell>
        <PageLoading />
      </AppShell>
    );
  const org = s.orgs.find((o) => o.id === id);
  if (!org)
    return (
      <AppShell>
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">We couldn't find that organization.</p>
          <Button variant="bison" asChild>
            <Link to="/orgs">All organizations</Link>
          </Button>
        </div>
      </AppShell>
    );
  const upcoming = upcomingEvents(s).filter((e) => e.org_id === org.id);
  return (
    <AppShell>
      <section className="mb-6 rounded-3xl bg-hero p-8 text-primary-foreground">
        <CategoryPill category={org.category} />
        <h1 className="mt-3 flex items-center gap-2 font-display text-3xl font-extrabold md:text-5xl">
          {org.name}{" "}
          {org.verified && <BadgeCheck className="size-7 shrink-0" aria-label="Verified" />}
        </h1>
        <p className="mt-3 max-w-2xl opacity-90">{org.description}</p>
        <p className="mt-3 flex items-center gap-3 text-sm opacity-90">
          <span className="flex items-center gap-1">
            <AtSign className="size-3.5" />
            {org.handle}
          </span>
          <span>{followerCount(s, org.id).toLocaleString()} followers</span>
        </p>
        <div className="mt-5">
          <FollowButton orgId={org.id} />
        </div>
      </section>
      <h2 className="mb-3 font-display text-2xl font-bold">Upcoming events</h2>
      <div className="grid gap-3">
        {upcoming.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
        {upcoming.length === 0 && <p className="text-muted-foreground">No upcoming events yet.</p>}
      </div>
    </AppShell>
  );
}
