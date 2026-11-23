import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { AppShell, PageLoading, SignInPrompt } from "@/components/AppShell";
import { CaptionParser } from "@/components/CaptionParser";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, type Category } from "@/lib/data";
import { actions, useDemo } from "@/lib/demo/store";
import { fromLocalInput, toLocalInput } from "@/lib/demo/time";
import type { ParsedCaption } from "@/lib/demo/caption";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Post an event — Engage+" },
      { name: "description", content: "Organization leaders can post events for Howard students." },
      { property: "og:title", content: "Post an event — Engage+" },
      {
        property: "og:description",
        content: "Organization leaders can post events for Howard students.",
      },
    ],
  }),
  component: Create,
});

const field = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm";
const blank = {
  title: "",
  description: "",
  category: "social" as Category,
  location: "",
  starts_at: "",
  ends_at: "",
  is_free: true,
};

function Create() {
  const s = useDemo();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [orgId, setOrgId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  if (loading)
    return (
      <AppShell>
        <PageLoading />
      </AppShell>
    );
  if (!user)
    return (
      <AppShell>
        <SignInPrompt message="Sign in to post events for your organization." />
      </AppShell>
    );

  const myOrgs = s.orgs.filter((o) => o.owner_id === user.id);
  const selectedOrg = orgId || myOrgs[0]?.id || "";
  const set = (patch: Partial<typeof blank>) => setForm((f) => ({ ...f, ...patch }));

  function fromCaption(p: ParsedCaption) {
    set({
      title: p.title,
      description: p.description,
      category: p.category,
      location: p.location,
      is_free: p.is_free,
      starts_at: p.starts_at ? toLocalInput(p.starts_at) : "",
      ends_at: p.ends_at ? toLocalInput(p.ends_at) : "",
    });
  }

  function publish(e: React.FormEvent) {
    e.preventDefault();
    try {
      const id = actions.createEvent({
        org_id: selectedOrg,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location.trim(),
        is_free: form.is_free,
        starts_at: fromLocalInput(form.starts_at),
        ends_at: form.ends_at ? fromLocalInput(form.ends_at) : null,
      });
      navigate({ to: "/events/$id", params: { id } });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Couldn't publish the event.");
    }
  }

  function registerOrg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = actions.createOrg({
      name: String(f.get("name")),
      description: String(f.get("description")),
      category: String(f.get("category")) as Category,
    });
    setOrgId(id);
    e.currentTarget.reset();
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 font-display text-4xl font-extrabold">Post an event</h1>
          <p className="text-muted-foreground">
            Turn your Instagram post into an Engage+ event in seconds.
          </p>
        </div>
        {myOrgs.length > 0 && (
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to="/dashboard">
              <BarChart3 /> Dashboard
            </Link>
          </Button>
        )}
      </div>
      {msg && <p className="mb-4 text-sm text-destructive">{msg}</p>}
      {myOrgs.length === 0 ? (
        <form
          onSubmit={registerOrg}
          className="mx-auto max-w-md space-y-3 rounded-3xl border bg-card p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold">Register your organization first</h2>
          <p className="text-sm text-muted-foreground">
            Only org managers can post. In production, we verify the org's email with a one-time
            code.
          </p>
          <Input name="name" placeholder="Organization name" required />
          <textarea name="description" placeholder="About the org" className={field} rows={3} />
          <select name="category" className={`${field} capitalize`}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button type="submit" className="w-full">
            Register org
          </Button>
        </form>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <CaptionParser onParsed={fromCaption} />
          <form onSubmit={publish} className="space-y-3 rounded-3xl border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Event details</h2>
            <select
              value={selectedOrg}
              onChange={(e) => setOrgId(e.target.value)}
              className={field}
              aria-label="Organization"
            >
              {myOrgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <Input
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Event title"
              required
              aria-label="Title"
            />
            <textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="What's happening?"
              className={field}
              rows={3}
              aria-label="Description"
            />
            <select
              value={form.category}
              onChange={(e) => set({ category: e.target.value as Category })}
              className={`${field} capitalize`}
              aria-label="Category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Input
              value={form.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="Location (e.g. Blackburn Center)"
              required
              aria-label="Location"
            />
            <label className="block text-xs font-medium text-muted-foreground">
              Starts (ET)
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => set({ starts_at: e.target.value })}
                required
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Ends (optional)
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => set({ ends_at: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_free}
                onChange={(e) => set({ is_free: e.target.checked })}
              />{" "}
              Free event
            </label>
            <Button type="submit" variant="bison" className="w-full">
              Publish event
            </Button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
