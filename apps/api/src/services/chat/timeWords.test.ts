import { nyLocalToUtc } from "../../lib/time.js";
import { NOW } from "./fixtures.js";
import { parseTimeWindow } from "./timeWords.js";

const ny = (date: string, time: string) => nyLocalToUtc(date, time).toISOString();
const window = (msg: string, now = NOW) => {
  const w = parseTimeWindow(msg, now);
  return w && { label: w.label, from: w.from.toISOString(), to: w.to.toISOString(), match: w.match };
};

test("TC-36 'this afternoon' is today 12:00–17:00, starting no earlier than now", () => {
  expect(window("anything this afternoon?")).toEqual({
    label: "this afternoon",
    from: ny("2026-11-11", "12:00"),
    to: ny("2026-11-11", "17:00"),
    match: "start",
  });
  const at3pm = new Date(ny("2026-11-11", "15:00"));
  expect(window("this afternoon", at3pm)?.from).toBe(at3pm.toISOString());
});

test("TC-36 'now' covers events in progress or starting within 2 hours", () => {
  expect(window("what's happening right now")).toEqual({
    label: "right now",
    from: NOW.toISOString(),
    to: new Date(NOW.getTime() + 2 * 3600_000).toISOString(),
    match: "overlap",
  });
});

test.each([
  ["tonight", "tonight", ["2026-11-11", "17:00"], ["2026-11-12", "03:00"]],
  ["tomorrow afternoon", "tomorrow afternoon", ["2026-11-12", "12:00"], ["2026-11-12", "17:00"]],
  ["tomorrow", "tomorrow", ["2026-11-12", "00:00"], ["2026-11-13", "00:00"]],
  ["friday night", "Friday night", ["2026-11-13", "17:00"], ["2026-11-14", "03:00"]],
  ["on Saturday", "Saturday", ["2026-11-14", "00:00"], ["2026-11-15", "00:00"]],
  ["this weekend", "this weekend", ["2026-11-14", "00:00"], ["2026-11-16", "00:00"]],
  ["tomorrow morning", "tomorrow morning", ["2026-11-12", "05:00"], ["2026-11-12", "12:00"]],
  ["this evening", "this evening", ["2026-11-11", "17:00"], ["2026-11-11", "21:00"]],
])("TC-36 time words: %s", (msg, label, [fd, ft], [td, tt]) => {
  expect(window(msg)).toMatchObject({ label, from: ny(fd, ft), to: ny(td, tt) });
});

test("TC-36 'this week' runs from now to Monday; 'today' from now to midnight", () => {
  expect(window("this week")).toMatchObject({ from: NOW.toISOString(), to: ny("2026-11-16", "00:00") });
  expect(window("events today")).toMatchObject({ label: "today", from: NOW.toISOString(), to: ny("2026-11-12", "00:00") });
});

test("TC-36 past parts of today give an empty window; no time words give null", () => {
  const morning = parseTimeWindow("this morning", NOW);
  expect(morning && morning.from >= morning.to).toBe(true);
  expect(parseTimeWindow("any career events?", NOW)).toBeNull();
});
