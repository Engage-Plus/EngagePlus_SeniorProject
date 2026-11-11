import { addDays, isValidLocalDate, nyDateString, nyLocalToUtc, weekdayName } from "./time.js";

test("TC-27 New York wall-clock times convert to UTC across DST", () => {
  expect(nyLocalToUtc("2026-11-13", "18:00").toISOString()).toBe("2026-11-13T23:00:00.000Z"); // EST
  expect(nyLocalToUtc("2026-07-04", "21:30").toISOString()).toBe("2026-07-05T01:30:00.000Z"); // EDT
  expect(nyLocalToUtc("2026-03-08", "03:30").toISOString()).toBe("2026-03-08T07:30:00.000Z"); // DST starts
  expect(nyLocalToUtc("2026-11-01", "00:30").toISOString()).toBe("2026-11-01T04:30:00.000Z"); // before DST ends
});

test("TC-27 New York date helpers", () => {
  // 03:00 UTC on Nov 12 is still Nov 11 in New York.
  expect(nyDateString(new Date("2026-11-12T03:00:00Z"))).toBe("2026-11-11");
  expect(weekdayName("2026-11-11")).toBe("Wednesday");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  expect(isValidLocalDate("2026-02-28")).toBe(true);
  expect(isValidLocalDate("2026-02-30")).toBe(false);
  expect(isValidLocalDate("Nov 13")).toBe(false);
});
