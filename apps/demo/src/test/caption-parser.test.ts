import { describe, expect, it } from "vitest";
import { EXAMPLE_CAPTIONS, parseCaption } from "@/lib/demo/caption";
import { etParts, etToUtc } from "@/lib/demo/time";

// Wednesday, Nov 18 2026, noon in New York.
const NOW = etToUtc(2026, 11, 18, 12, 0);
const et = (iso: string | null) => (iso ? etParts(new Date(iso)) : null);

describe("caption parser (F14)", () => {
  it("TC-27 extracts title, date, time range, location and price", () => {
    const p = parseCaption(EXAMPLE_CAPTIONS[0] ?? "", NOW);
    expect(p.title).toBe("Winter Code Jam");
    expect(p.location).toBe("iLab, Founders Library");
    expect(p.category).toBe("academic");
    expect(p.is_free).toBe(true);
    expect(et(p.starts_at)).toMatchObject({ month: 11, day: 20, hour: 18, minute: 0 }); // Friday
    expect(et(p.ends_at)).toMatchObject({ day: 20, hour: 21 });
    expect(p.found).toEqual({ title: true, date: true, time: true, location: true });
  });

  it("TC-27 handles 'tomorrow', a single time and a known venue", () => {
    const p = parseCaption(EXAMPLE_CAPTIONS[1] ?? "", NOW);
    expect(et(p.starts_at)).toMatchObject({ day: 19, hour: 19, minute: 30 });
    expect(p.location).toBe("Douglass Hall");
  });

  it("TC-27 reads month names, prices and 'Location:' labels", () => {
    const p = parseCaption(
      "Recruiter Mixer\nDec 3rd 5:30pm - 7pm\nLocation: School of Business Atrium\n$5 entry, networking",
      NOW,
    );
    expect(et(p.starts_at)).toMatchObject({ month: 12, day: 3, hour: 17, minute: 30 });
    expect(et(p.ends_at)).toMatchObject({ hour: 19 });
    expect(p.location).toBe("School of Business Atrium");
    expect(p.is_free).toBe(false);
    expect(p.category).toBe("professional");
  });

  it("TC-28 reports missing fields instead of guessing", () => {
    const p = parseCaption("new merch drop soon!! stay tuned", NOW);
    expect(p.starts_at).toBeNull();
    expect(p.found.date).toBe(false);
    expect(p.found.location).toBe(false);
  });

  it("does not read words like 'friends' or 'money' as weekdays", () => {
    const p = parseCaption("Bring friends and money for snacks", NOW);
    expect(p.starts_at).toBeNull();
  });
});
