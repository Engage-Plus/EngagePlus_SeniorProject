import { describe, expect, it } from "vitest";
import { filterEvents } from "@/lib/data";

const events = [
  { title: "Intro to React", description: "coding", category: "academic" },
  { title: "Caribbean Night", description: "soca", category: "cultural" },
];

describe("filterEvents", () => {
  it("searches by name", () => {
    expect(filterEvents(events, "react", null).map((e) => e.title)).toEqual(["Intro to React"]);
  });
  it("filters by category", () => {
    expect(filterEvents(events, "", "cultural").map((e) => e.title)).toEqual(["Caribbean Night"]);
  });
});
