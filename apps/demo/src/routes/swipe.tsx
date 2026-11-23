import { createFileRoute, Link } from "@tanstack/react-router";
import { PartyPopper } from "lucide-react";
import { AppShell, PageLoading, SignInPrompt } from "@/components/AppShell";
import { SwipeDeck } from "@/components/SwipeDeck";
import { useAuth } from "@/lib/auth";
import { actions, useDemo } from "@/lib/demo/store";
import { recommend } from "@/lib/demo/logic";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/swipe")({
  head: () => ({
    meta: [
      { title: "Swipe events — Engage+" },
      {
        name: "description",
        content: "Swipe through Howard events picked for you: RSVP, follow or skip.",
      },
      { property: "og:title", content: "Swipe events — Engage+" },
      { property: "og:description", content: "Swipe through Howard events picked for you." },
    ],
  }),
  component: Swipe,
});

function Swipe() {
  const s = useDemo();
  const { user, loading } = useAuth();
  const recs = user ? recommend(s, user.id) : [];
  const swiped = user ? Object.keys(s.swipes[user.id] ?? {}).length : 0;

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold">For you</h1>
          <p className="text-sm text-muted-foreground">
            Ranked by orgs you follow, your interests, friends and your class schedule.
          </p>
        </div>
        {user && <span className="shrink-0 text-sm text-muted-foreground">{recs.length} left</span>}
      </div>
      {loading ? (
        <PageLoading />
      ) : !user ? (
        <SignInPrompt message="Sign in to get a feed picked for you." />
      ) : recs.length ? (
        <SwipeDeck recs={recs} />
      ) : (
        <div className="mx-auto max-w-sm rounded-3xl border border-dashed p-10 text-center">
          <PartyPopper className="mx-auto mb-3 size-10 text-accent" />
          <p className="font-display text-xl font-bold">You're all caught up</p>
          <p className="mb-5 text-sm text-muted-foreground">
            You've been through {swiped} events. Check what you're going to.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="bison" asChild>
              <Link to="/my-events">My Events</Link>
            </Button>
            <Button variant="outline" onClick={() => actions.clearSwipes()}>
              Start over
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
