import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = ["academic", "cultural", "professional", "social"] as const;
export type Category = (typeof CATEGORIES)[number];

export const catClass: Record<string, string> = {
  academic: "bg-cat-academic text-primary-foreground",
  cultural: "bg-cat-cultural text-primary-foreground",
  professional: "bg-cat-professional text-primary-foreground",
  social: "bg-cat-social text-primary-foreground",
};

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*, organizations(id, name)")
      .gte("starts_at", new Date(Date.now() - 6 * 3600e3).toISOString())
      .order("starts_at");
    if (error) throw error;
    return data;
  },
});

export const orgsQuery = queryOptions({
  queryKey: ["orgs"],
  queryFn: async () => {
    const { data, error } = await supabase.from("organizations").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const myRsvpsQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["rsvps", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("rsvps").select("event_id");
      if (error) throw error;
      return new Set(data.map((r) => r.event_id));
    },
  });

export const myFollowsQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["follows", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("follows").select("org_id");
      if (error) throw error;
      return new Set(data.map((r) => r.org_id));
    },
  });

export function formatWhen(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { weekday: "short" }),
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  };
}

export function filterEvents<T extends { title: string; description: string; category: string }>(
  events: T[],
  search: string,
  category: string | null,
) {
  const q = search.trim().toLowerCase();
  return events.filter(
    (e) =>
      (!category || e.category === category) &&
      (!q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
  );
}
