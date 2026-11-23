import { useEffect, useRef, useState } from "react";
import { Check, MapPin, Sparkles, UserPlus, X } from "lucide-react";
import { catGradient, formatWhen } from "@/lib/data";
import { actions, useDemo } from "@/lib/demo/store";
import { rsvpCount, type Recommendation } from "@/lib/demo/logic";
import type { SwipeAction } from "@/lib/demo/types";
import { CategoryPill, FriendsGoing } from "@/components/EventBits";
import { Button } from "@/components/ui/button";

const THRESHOLD = 110;
const LABEL: Record<SwipeAction, string> = {
  rsvp: "RSVP'd",
  follow: "Following org",
  skip: "Skipped",
};

/** Swipe right = RSVP, up = follow the org, left = skip (F2). Buttons and arrow keys do the same. */
export function SwipeDeck({ recs }: { recs: Recommendation[] }) {
  const s = useDemo();
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [flash, setFlash] = useState<string | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const top = recs[0];

  function decide(action: SwipeAction) {
    if (!top) return;
    actions.swipe(top.event.id, action);
    setDrag({ x: 0, y: 0, active: false });
    setFlash(`${LABEL[action]}: ${top.event.title}`);
  }

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") decide("rsvp");
      if (e.key === "ArrowLeft") decide("skip");
      if (e.key === "ArrowUp") decide("follow");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!top) return null;
  const e = top.event;
  const w = formatWhen(e.starts_at);
  const hint = drag.x > 40 ? "rsvp" : drag.x < -40 ? "skip" : drag.y < -40 ? "follow" : null;

  return (
    <div className="mx-auto max-w-sm">
      <p
        className="mb-2 h-5 truncate text-center text-sm font-medium text-accent"
        role="status"
        aria-live="polite"
      >
        {flash}
      </p>
      <div className="relative h-[430px] select-none">
        {recs[1] && (
          <div
            className="absolute inset-0 translate-y-3 scale-95 rounded-3xl border bg-card opacity-70 shadow-card"
            aria-hidden
          />
        )}
        <article
          className="absolute inset-0 flex cursor-grab touch-none flex-col overflow-hidden rounded-3xl border bg-card shadow-card active:cursor-grabbing"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`,
            transition: drag.active ? "none" : "transform 200ms ease",
          }}
          onPointerDown={(ev) => {
            start.current = { x: ev.clientX, y: ev.clientY };
            ev.currentTarget.setPointerCapture?.(ev.pointerId);
            setDrag({ x: 0, y: 0, active: true });
          }}
          onPointerMove={(ev) => {
            if (!drag.active) return;
            setDrag({
              x: ev.clientX - start.current.x,
              y: ev.clientY - start.current.y,
              active: true,
            });
          }}
          onPointerUp={() => {
            if (drag.x > THRESHOLD) decide("rsvp");
            else if (drag.x < -THRESHOLD) decide("skip");
            else if (drag.y < -THRESHOLD) decide("follow");
            else setDrag({ x: 0, y: 0, active: false });
          }}
        >
          <div
            className={`relative flex h-48 shrink-0 flex-col justify-end bg-gradient-to-br p-5 text-primary-foreground ${catGradient[e.category]}`}
          >
            {hint && (
              <span className="absolute right-4 top-4 rounded-full bg-card px-3 py-1 text-sm font-bold uppercase text-foreground shadow">
                {hint === "rsvp" ? "RSVP" : hint === "skip" ? "Skip" : "Follow"}
              </span>
            )}
            <p className="text-sm font-semibold opacity-90">{e.organizations?.name}</p>
            <h2 className="font-display text-2xl font-extrabold leading-tight">{e.title}</h2>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryPill category={e.category} />
              <span className="text-sm text-muted-foreground">
                {e.is_free ? "Free" : "Paid"} · {rsvpCount(s, e.id)} going
              </span>
            </div>
            <p className="text-sm font-medium">
              {w.day}, {w.date} · {w.time}
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" /> {e.location}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
            <FriendsGoing eventId={e.id} />
            <div className="mt-auto rounded-xl bg-muted p-3 text-xs">
              <p className="mb-1 flex items-center gap-1 font-semibold">
                <Sparkles className="size-3.5 text-accent" /> Why you're seeing this
              </p>
              <ul className="list-disc pl-4 text-muted-foreground">
                {top.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <Button
          size="icon"
          variant="outline"
          className="size-14 rounded-full"
          onClick={() => decide("skip")}
          aria-label="Skip"
        >
          <X className="size-6" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="size-12 rounded-full"
          onClick={() => decide("follow")}
          aria-label="Follow org"
        >
          <UserPlus className="size-5" />
        </Button>
        <Button
          size="icon"
          variant="bison"
          className="size-14 rounded-full"
          onClick={() => decide("rsvp")}
          aria-label="RSVP"
        >
          <Check className="size-6" />
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Drag right to RSVP, up to follow, left to skip. Arrow keys work too.
      </p>
    </div>
  );
}
