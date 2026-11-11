import { fallbackParse, guessCategory } from "./fallback.js";
import { findDate, findTimes } from "./fallbackDateTime.js";
import {
  CAREER_CAPTION,
  CULTURE_CAPTION,
  GAME_NIGHT_CAPTION,
  LATE_CAPTION,
  NEXT_YEAR_CAPTION,
  NOW,
  STUDY_CAPTION,
  VAGUE_CAPTION,
} from "./fixtures.js";

const TODAY = "2026-11-11"; // Wednesday

test("TC-27 fallback parses an emoji-heavy career caption", () => {
  const f = fallbackParse(CAREER_CAPTION, NOW);
  expect(f).toMatchObject({
    title: "Fall Career Fair Prep Workshop",
    category: "PROFESSIONAL",
    location: "Blackburn Center Ballroom",
    date: "2026-11-13",
    startTime: "18:00",
    endTime: "20:00",
  });
});

test("TC-27 fallback parses numeric dates, flags and 'Location:'", () => {
  expect(fallbackParse(CULTURE_CAPTION, NOW)).toMatchObject({
    title: "Caribbean Students Association presents CULTURE NIGHT",
    category: "CULTURAL",
    location: "Cramton Auditorium",
    date: "2026-11-20",
    startTime: "19:30",
    endTime: null,
  });
});

test("TC-27 fallback leaves unknown fields null", () => {
  expect(fallbackParse(VAGUE_CAPTION, NOW)).toEqual({
    title: "Just vibes",
    description: VAGUE_CAPTION,
    category: null,
    location: null,
    date: null,
    startTime: null,
    endTime: null,
  });
  expect(fallbackParse(GAME_NIGHT_CAPTION, NOW)).toMatchObject({
    date: "2026-11-12",
    startTime: null,
    location: null,
    category: "SOCIAL",
  });
});

test("TC-27 fallback relative dates and year rollover", () => {
  expect(findDate("this Friday", TODAY)).toBe("2026-11-13");
  expect(findDate("Wednesday", TODAY)).toBe("2026-11-11");
  expect(findDate("next Wednesday", TODAY)).toBe("2026-11-18");
  expect(findDate("tonight", TODAY)).toBe(TODAY);
  expect(findDate(NEXT_YEAR_CAPTION, TODAY)).toBe("2027-01-15");
  expect(findDate("Nov 5", TODAY)).toBe("2026-11-05"); // last week: keep this year
  expect(findDate("Feb 30", TODAY)).toBeNull();
  expect(findDate("12/1/2027", TODAY)).toBe("2027-12-01");
  expect(findDate("fun in the sun", TODAY)).toBeNull();
});

test("TC-27 fallback time ranges and am/pm inference", () => {
  expect(findTimes("6-8pm")).toEqual({ startTime: "18:00", endTime: "20:00" });
  expect(findTimes(STUDY_CAPTION)).toEqual({ startTime: "11:00", endTime: "13:00" });
  expect(findTimes("7:30 p.m. to 9 p.m.")).toEqual({ startTime: "19:30", endTime: "21:00" });
  expect(findTimes("12pm")).toEqual({ startTime: "12:00", endTime: null });
  expect(findTimes("12am")).toEqual({ startTime: "00:00", endTime: null });
  expect(findTimes(NEXT_YEAR_CAPTION)).toEqual({ startTime: "12:00", endTime: null });
  expect(findTimes("Room 304")).toEqual({ startTime: null, endTime: null });
  expect(fallbackParse(LATE_CAPTION, NOW)).toMatchObject({
    date: "2026-11-14",
    startTime: "22:00",
    endTime: "02:00",
    location: "The Yard",
  });
});

test("TC-27 fallback category guess is null when unclear", () => {
  expect(guessCategory("career networking night")).toBe("PROFESSIONAL");
  expect(guessCategory("study party")).toBeNull(); // tie
  expect(guessCategory("general body meeting")).toBeNull();
});
