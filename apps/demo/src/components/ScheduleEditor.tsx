import { useState } from "react";
import { Trash2 } from "lucide-react";
import { actions } from "@/lib/demo/store";
import { SAMPLE_CLASSES } from "@/lib/demo/seed";
import type { ClassBlock } from "@/lib/demo/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Class schedule (F12). Events overlapping these blocks are flagged and can be hidden. */
export function ScheduleEditor({ classes }: { classes: ClassBlock[] }) {
  const [name, setName] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("09:50");
  const [error, setError] = useState<string | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!days.length) return setError("Pick at least one day.");
    if (end <= start) return setError("End time must be after start time.");
    setError(null);
    actions.setClasses([
      ...classes,
      { id: `c-${Date.now().toString(36)}`, name: name.trim(), days, start, end },
    ]);
    setName("");
    setDays([]);
  }

  return (
    <section className="rounded-3xl border bg-card p-6 shadow-card">
      <h2 className="font-display text-xl font-bold">My class schedule</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        We hide or flag events that overlap your classes.
      </p>
      <ul className="mb-4 space-y-2">
        {classes.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2 text-sm"
          >
            <span>
              <b>{c.name}</b> · {c.days.map((d) => DAYS[d]).join("/")} · {c.start}–{c.end}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${c.name}`}
              onClick={() => actions.setClasses(classes.filter((x) => x.id !== c.id))}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
        {classes.length === 0 && (
          <li className="text-sm text-muted-foreground">
            No classes yet.{" "}
            <button
              className="text-accent underline"
              onClick={() => actions.setClasses(SAMPLE_CLASSES)}
            >
              Load a sample schedule
            </button>
          </li>
        )}
      </ul>
      <form onSubmit={add} className="space-y-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Course (e.g. BIOL 101)"
          required
          aria-label="Course name"
        />
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((d, i) => (
            <button
              type="button"
              key={d}
              onClick={() =>
                setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i].sort())
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium ${days.includes(i) ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}
              aria-pressed={days.includes(i)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="flex-1 text-xs font-medium text-muted-foreground">
            Starts
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
          </label>
          <label className="flex-1 text-xs font-medium text-muted-foreground">
            Ends
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="outline" className="w-full">
          Add class
        </Button>
      </form>
    </section>
  );
}
