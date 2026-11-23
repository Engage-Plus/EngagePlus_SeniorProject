import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Sparkles } from "lucide-react";
import { AppShell, PageLoading } from "@/components/AppShell";
import { CategoryPill, FollowButton } from "@/components/EventBits";
import { useDemo } from "@/lib/demo/store";
import { followerCount } from "@/lib/demo/logic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orgs/")({
  head: () => ({
    meta: [
      { title: "Organizations — Engage+" },
      {
        name: "description",
        content: "Explore and follow Howard University student organizations.",
      },
      { property: "og:title", content: "Organizations — Engage+" },
      {
        property: "og:description",
        content: "Explore and follow Howard University student organizations.",
      },
    ],
  }),
  component: Orgs,
});

function Orgs() {
  const s = useDemo();
  const [q, setQ] = useState("");
  const shown = [...s.orgs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl font-extrabold">Organizations</h1>
        <Button variant="outline" size="sm" asChild className="rounded-full">
          <Link to="/quiz">
            <Sparkles /> Match me with orgs
          </Link>
        </Button>
      </div>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search orgs…"
        className="mb-5 h-11 rounded-full bg-card"
        aria-label="Search orgs"
      />
      {!s.ready ? (
        <PageLoading />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((o) => (
            <Link
              key={o.id}
              to="/orgs/$id"
              params={{ id: o.id }}
              className="flex items-start gap-4 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                {o.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-1 font-display font-bold leading-snug">
                  {o.name}{" "}
                  {o.verified && (
                    <BadgeCheck className="size-4 shrink-0 text-accent" aria-label="Verified" />
                  )}
                </h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{o.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <CategoryPill category={o.category} />
                  <span className="text-xs text-muted-foreground">
                    {followerCount(s, o.id).toLocaleString()} followers
                  </span>
                </div>
              </div>
              <FollowButton orgId={o.id} />
            </Link>
          ))}
          {shown.length === 0 && <p className="text-muted-foreground">No orgs match “{q}”.</p>}
        </div>
      )}
    </AppShell>
  );
}
