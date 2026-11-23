import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Megaphone, RotateCcw } from "lucide-react";
import { AppShell, PageLoading } from "@/components/AppShell";
import { actions, useDemo } from "@/lib/demo/store";
import { MANAGER_ID, STUDENT_ID } from "@/lib/demo/seed";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Engage+" },
      { name: "description", content: "Sign in to Engage+ with your Howard account." },
      { property: "og:title", content: "Sign in — Engage+" },
      { property: "og:description", content: "Sign in to Engage+ with your Howard account." },
    ],
  }),
  component: Login,
});

const personas = [
  {
    id: STUDENT_ID,
    icon: GraduationCap,
    title: "Student",
    blurb: "Discover, swipe, RSVP and follow orgs.",
    to: "/swipe",
  },
  {
    id: MANAGER_ID,
    icon: Megaphone,
    title: "Org manager",
    blurb: "Post events from Instagram captions, see analytics.",
    to: "/dashboard",
  },
] as const;

function Login() {
  const s = useDemo();
  const navigate = useNavigate();
  const [resetDone, setResetDone] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-3xl font-extrabold">Welcome, Bison</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Engage+ signs you in with your Howard Microsoft account; only Howard's tenant is allowed.
          For this demo, pick an example account.
        </p>
        <Button
          variant="outline"
          className="mt-5 w-full"
          disabled
          title="Live Howard sign-in is in testing (F21)"
        >
          Sign in with Microsoft (coming soon)
        </Button>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> Demo accounts{" "}
          <span className="h-px flex-1 bg-border" />
        </div>
        {!s.ready ? (
          <PageLoading />
        ) : (
          <div className="space-y-3">
            {personas.map((p) => {
              const person = s.people.find((x) => x.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    actions.signIn(p.id);
                    navigate({ to: p.to });
                  }}
                  className="flex w-full items-start gap-3 rounded-2xl border bg-background p-4 text-left transition hover:border-accent hover:bg-accent/10"
                >
                  <p.icon className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span>
                    <span className="block font-semibold">
                      {p.title}: {person?.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">{person?.email}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{p.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <button
          className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            actions.resetDemo();
            setResetDone(true);
          }}
        >
          <RotateCcw className="size-3.5" /> {resetDone ? "Demo data reset" : "Reset demo data"}
        </button>
      </div>
    </AppShell>
  );
}
