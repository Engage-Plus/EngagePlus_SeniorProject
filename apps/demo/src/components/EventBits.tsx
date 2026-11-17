import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Check, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { catClass, formatWhen, myFollowsQuery, myRsvpsQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";

export function CategoryPill({ category }: { category: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${catClass[category] ?? "bg-muted"}`}>
      {category}
    </span>
  );
}

type EventRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  starts_at: string;
  is_free: boolean;
  organizations: { id: string; name: string } | null;
};

export function EventCard({ event }: { event: EventRow }) {
  const w = formatWhen(event.starts_at);
  return (
    <div className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary py-2 text-primary-foreground">
        <span className="text-xs uppercase opacity-80">{w.day}</span>
        <span className="font-display text-lg font-bold leading-tight">{w.date}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <CategoryPill category={event.category} />
          {event.is_free && <span className="text-xs font-medium text-muted-foreground">Free</span>}
        </div>
        <Link to="/events/$id" params={{ id: event.id }} className="block font-display text-lg font-bold leading-snug hover:text-accent">
          {event.title}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          {event.organizations?.name} · {w.time}
        </p>
        <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
          <MapPin className="size-3.5" /> {event.location}
        </p>
      </div>
      <div className="self-center">
        <RsvpButton eventId={event.id} compact />
      </div>
    </div>
  );
}

export function RsvpButton({ eventId, compact }: { eventId: string; compact?: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: rsvps } = useQuery(myRsvpsQuery(user?.id));
  const going = rsvps?.has(eventId) ?? false;
  const m = useMutation({
    mutationFn: async () => {
      if (!user) return navigate({ to: "/login" });
      const res = going
        ? await supabase.from("rsvps").delete().eq("event_id", eventId).eq("user_id", user.id)
        : await supabase.from("rsvps").insert({ event_id: eventId, user_id: user.id });
      if (res.error) throw res.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rsvps"] }),
  });
  return (
    <Button
      variant={going ? "secondary" : "bison"}
      size={compact ? "sm" : "lg"}
      disabled={m.isPending}
      onClick={() => m.mutate()}
      className="rounded-full"
    >
      {going ? <Check /> : <Plus />} {going ? "Going" : "RSVP"}
    </Button>
  );
}

export function FollowButton({ orgId }: { orgId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: follows } = useQuery(myFollowsQuery(user?.id));
  const following = follows?.has(orgId) ?? false;
  const m = useMutation({
    mutationFn: async () => {
      if (!user) return navigate({ to: "/login" });
      const res = following
        ? await supabase.from("follows").delete().eq("org_id", orgId).eq("user_id", user.id)
        : await supabase.from("follows").insert({ org_id: orgId, user_id: user.id });
      if (res.error) throw res.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["follows"] }),
  });
  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      className="rounded-full"
      disabled={m.isPending}
      onClick={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
