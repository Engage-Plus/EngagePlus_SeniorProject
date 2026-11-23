import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AppShell, PageLoading, SignInPrompt } from "@/components/AppShell";
import { CategoryPill, FollowButton } from "@/components/EventBits";
import { useAuth } from "@/lib/auth";
import { actions, useDemo } from "@/lib/demo/store";
import { QUIZ, quizMatches } from "@/lib/demo/logic";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Find your orgs — Engage+" },
      {
        name: "description",
        content: "Answer three questions and get matched with Howard student organizations.",
      },
      { property: "og:title", content: "Find your orgs — Engage+" },
      { property: "og:description", content: "Three questions, matched Howard orgs." },
    ],
  }),
  component: Quiz,
});

function Quiz() {
  const s = useDemo();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const done = step >= QUIZ.length;
  const matches = done ? quizMatches(s.orgs, tags) : [];
  const question = QUIZ[step];

  function answer(optionTags: string[]) {
    const next = [...new Set([...tags, ...optionTags])];
    setTags(next);
    if (step === QUIZ.length - 1) actions.setInterests(next);
    setStep(step + 1);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-1 flex items-center gap-2 font-display text-4xl font-extrabold">
          <Sparkles className="size-7 text-accent" /> Find your orgs
        </h1>
        <p className="mb-6 text-muted-foreground">
          Three questions. We'll match you with orgs and tune your swipe feed.
        </p>
        {loading ? (
          <PageLoading />
        ) : !user ? (
          <SignInPrompt message="Sign in to save your matches." />
        ) : question ? (
          <div className="rounded-3xl border bg-card p-6 shadow-card">
            <Progress value={(step / QUIZ.length) * 100} className="mb-5" />
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Question {step + 1} of {QUIZ.length}
            </p>
            <h2 className="mb-5 font-display text-2xl font-bold">{question.prompt}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((o) => (
                <button
                  key={o.label}
                  onClick={() => answer(o.tags)}
                  className="rounded-2xl border bg-background p-4 text-left font-medium transition hover:border-accent hover:bg-accent/10"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border bg-card p-6 shadow-card">
              <h2 className="font-display text-2xl font-bold">Your matches</h2>
              <p className="text-sm text-muted-foreground">Interests saved: {tags.join(", ")}</p>
            </div>
            {matches.map(({ org, score }) => (
              <div
                key={org.id}
                className="flex items-start gap-4 rounded-2xl border bg-card p-4 shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to="/orgs/$id"
                    params={{ id: org.id }}
                    className="font-display text-lg font-bold hover:text-accent"
                  >
                    {org.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{org.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <CategoryPill category={org.category} />
                    <span className="text-xs text-muted-foreground">
                      {Math.min(99, 60 + score * 13)}% match
                    </span>
                  </div>
                </div>
                <FollowButton orgId={org.id} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="bison" asChild className="flex-1">
                <Link to="/swipe">See my feed</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep(0);
                  setTags([]);
                }}
              >
                Retake
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
