import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CategoryPill, FollowButton } from "@/components/EventBits";
import { orgsQuery } from "@/lib/data";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/orgs/")({
  head: () => ({
    meta: [
      { title: "Organizations — Engage+" },
      { name: "description", content: "Explore and follow Howard University student organizations." },
      { property: "og:title", content: "Organizations — Engage+" },
      { property: "og:description", content: "Explore and follow Howard University student organizations." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(orgsQuery),
  component: Orgs,
});

function Orgs() {
  const { data: orgs } = useSuspenseQuery(orgsQuery);
  const [q, setQ] = useState("");
  const shown = orgs.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell>
      <h1 className="mb-4 font-display text-4xl font-extrabold">Organizations</h1>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orgs…" className="mb-5 h-11 rounded-full bg-card" />
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((o) => (
          <Link key={o.id} to="/orgs/$id" params={{ id: o.id }} className="flex items-start gap-4 rounded-2xl border bg-card p-4 shadow-card hover:-translate-y-0.5 transition">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              {o.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-bold leading-snug">{o.name}</h2>
              <p className="line-clamp-2 text-sm text-muted-foreground">{o.description}</p>
              <div className="mt-2"><CategoryPill category={o.category} /></div>
            </div>
            <FollowButton orgId={o.id} />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
