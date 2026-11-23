import { useState } from "react";
import { Instagram, Wand2 } from "lucide-react";
import { EXAMPLE_CAPTIONS, parseCaption, type ParsedCaption } from "@/lib/demo/caption";
import { Button } from "@/components/ui/button";

const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

/** Paste an Instagram caption, get a pre-filled event form (F14). */
export function CaptionParser({ onParsed }: { onParsed: (p: ParsedCaption) => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ParsedCaption | null>(null);

  function run() {
    const parsed = parseCaption(text);
    setResult(parsed);
    onParsed(parsed);
  }

  const missing = result
    ? (Object.entries(result.found) as [string, boolean][]).filter(([, ok]) => !ok).map(([k]) => k)
    : [];

  return (
    <section className="rounded-3xl border bg-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <Instagram className="size-5 text-accent" /> Post from an Instagram caption
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Paste the caption you already wrote. We'll fill in the form; you check it and publish.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className={field}
        placeholder={"e.g. Winter Code Jam 🎄 Friday 6-9pm 📍 iLab, Founders Library. Free!"}
        aria-label="Instagram caption"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="bison" onClick={run} disabled={!text.trim()}>
          <Wand2 /> Fill the form
        </Button>
        {EXAMPLE_CAPTIONS.map((c, i) => (
          <Button key={i} type="button" variant="outline" size="sm" onClick={() => setText(c)}>
            Example {i + 1}
          </Button>
        ))}
      </div>
      {result && (
        <p className="mt-3 text-sm" role="status">
          {missing.length === 0 ? (
            <span className="font-medium text-cat-professional">
              Found title, date, time and location. Check them below.
            </span>
          ) : (
            <span className="font-medium text-accent">
              Couldn't find: {missing.join(", ")}. Fill those in below.
            </span>
          )}
          <span className="mt-1 block text-xs text-muted-foreground">
            Demo uses the rule-based parser. In production, Gemini reads the caption first (no names
            or emails sent) and these rules are the fallback.
          </span>
        </p>
      )}
    </section>
  );
}
