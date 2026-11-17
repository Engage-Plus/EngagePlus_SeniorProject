import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { CATEGORIES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create an event — Engage+" },
      { name: "description", content: "Organization leaders can post events for Howard students." },
      { property: "og:title", content: "Create an event — Engage+" },
      { property: "og:description", content: "Organization leaders can post events for Howard students." },
    ],
  }),
  component: Create,
});

const field = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm";

function Create() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: myOrgs, refetch } = useQuery({
    queryKey: ["my-orgs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("id, name").eq("owner_id", user!.id);
      if (error) throw error;
      return data;
    },
  });
  const [msg, setMsg] = useState<string | null>(null);

  if (!loading && !user)
    return (
      <AppShell>
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">Sign in to create organizations and events.</p>
          <Button variant="bison" asChild><Link to="/login">Sign in</Link></Button>
        </div>
      </AppShell>
    );

  async function createOrg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("organizations").insert({
      name: String(f.get("name")),
      description: String(f.get("description")),
      category: String(f.get("category")),
      owner_id: user!.id,
    });
    if (error) return setMsg(error.message);
    e.currentTarget.reset();
    refetch();
    qc.invalidateQueries({ queryKey: ["orgs"] });
  }

  async function createEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const start = new Date(String(f.get("starts_at")));
    const endRaw = String(f.get("ends_at") || "");
    const { data, error } = await supabase
      .from("events")
      .insert({
        org_id: String(f.get("org_id")),
        title: String(f.get("title")),
        description: String(f.get("description")),
        category: String(f.get("category")),
        location: String(f.get("location")),
        starts_at: start.toISOString(),
        ends_at: endRaw ? new Date(endRaw).toISOString() : null,
        is_free: f.get("is_free") === "on",
        created_by: user!.id,
      })
      .select("id")
      .single();
    if (error) return setMsg(error.message);
    qc.invalidateQueries({ queryKey: ["events"] });
    navigate({ to: "/events/$id", params: { id: data.id } });
  }

  return (
    <AppShell>
      <h1 className="mb-1 font-display text-4xl font-extrabold">Create</h1>
      <p className="mb-6 text-muted-foreground">Lead an org? Register it, then publish events students can RSVP to.</p>
      {msg && <p className="mb-4 text-sm text-accent">{msg}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={createEvent} className="space-y-3 rounded-3xl border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold">New event</h2>
          {myOrgs && myOrgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Register an organization first →</p>
          ) : (
            <>
              <select name="org_id" required className={field}>
                {myOrgs?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <Input name="title" placeholder="Event title" required />
              <textarea name="description" placeholder="What's happening?" className={field} rows={3} />
              <select name="category" className={`${field} capitalize`}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input name="location" placeholder="Location (e.g. Blackburn Center)" required />
              <label className="block text-xs font-medium text-muted-foreground">Starts
                <Input name="starts_at" type="datetime-local" required />
              </label>
              <label className="block text-xs font-medium text-muted-foreground">Ends (optional)
                <Input name="ends_at" type="datetime-local" />
              </label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_free" defaultChecked /> Free event</label>
              <Button type="submit" variant="bison" className="w-full">Publish event</Button>
            </>
          )}
        </form>
        <form onSubmit={createOrg} className="space-y-3 self-start rounded-3xl border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold">Register an organization</h2>
          <Input name="name" placeholder="Organization name" required />
          <textarea name="description" placeholder="About the org" className={field} rows={3} />
          <select name="category" className={`${field} capitalize`}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button type="submit" className="w-full">Register org</Button>
          {myOrgs && myOrgs.length > 0 && (
            <p className="text-xs text-muted-foreground">You lead: {myOrgs.map((o) => o.name).join(", ")}</p>
          )}
        </form>
      </div>
    </AppShell>
  );
}
