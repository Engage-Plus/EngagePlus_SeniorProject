import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Check, Plus, TriangleAlert, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { catClass, formatWhen } from "@/lib/data";
import { actions, useDemo } from "@/lib/demo/store";
import { conflictingClass, friendsGoing, rsvpCount, type EventWithOrg } from "@/lib/demo/logic";
import { Button } from "@/components/ui/button";

export function CategoryPill({ category }: { category: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${catClass[category] ?? "bg-muted"}`}
    >
      {category}
    </span>
  );
}

export function FriendsGoing({ eventId }: { eventId: string }) {
  const s = useDemo();
  const friends = friendsGoing(s, s.userId, eventId);
  if (!friends.length) return null;
  const names = friends.map((f) => f.name.split(" ")[0]);
  return (
    <p className="flex items-center gap-1 text-xs font-medium text-accent">
      <Users className="size-3.5" /> {names.slice(0, 2).join(", ")}
      {names.length > 2 ? ` +${names.length - 2}` : ""} going
    </p>
  );
}

export function EventCard({ event }: { event: EventWithOrg }) {
  const s = useDemo();
  const w = formatWhen(event.starts_at);
  const clash = s.userId ? conflictingClass(event, s.classes[s.userId] ?? []) : null;
  return (
    <div className="flex min-w-0 gap-4 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary py-2 text-primary-foreground">
        <span className="text-xs uppercase opacity-80">{w.day}</span>
        <span className="font-display text-lg font-bold leading-tight">{w.date}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <CategoryPill category={event.category} />
          {event.is_free && <span className="text-xs font-medium text-muted-foreground">Free</span>}
          <span className="text-xs text-muted-foreground">{rsvpCount(s, event.id)} going</span>
        </div>
        <Link
          to="/events/$id"
          params={{ id: event.id }}
          className="block font-display text-lg font-bold leading-snug hover:text-accent"
        >
          {event.title}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          {event.organizations?.name} · {w.time}
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{event.location}</span>
        </p>
        <FriendsGoing eventId={event.id} />
        {clash && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
            <TriangleAlert className="size-3.5" /> Overlaps {clash.name}
          </p>
        )}
      </div>
      <div className="self-center">
        <RsvpButton eventId={event.id} compact />
      </div>
    </div>
  );
}

export function RsvpButton({ eventId, compact }: { eventId: string; compact?: boolean }) {
  const { user } = useAuth();
  const s = useDemo();
  const navigate = useNavigate();
  const going = !!user && (s.rsvps[user.id] ?? []).includes(eventId);
  return (
    <Button
      variant={going ? "secondary" : "bison"}
      size={compact ? "sm" : "lg"}
      onClick={() => (user ? actions.toggleRsvp(eventId) : navigate({ to: "/login" }))}
      className="rounded-full"
    >
      {going ? <Check /> : <Plus />} {going ? "Going" : "RSVP"}
    </Button>
  );
}

export function FollowButton({ orgId }: { orgId: string }) {
  const { user } = useAuth();
  const s = useDemo();
  const navigate = useNavigate();
  const following = !!user && (s.follows[user.id] ?? []).includes(orgId);
  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      className="rounded-full"
      onClick={(e) => {
        e.preventDefault();
        if (user) actions.toggleFollow(orgId);
        else navigate({ to: "/login" });
      }}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
