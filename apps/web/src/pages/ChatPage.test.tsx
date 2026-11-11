import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ChatResponse } from "@engageplus/shared";
import { App } from "../App";

const RESPONSE: ChatResponse = {
  reply: "Here are 2 events this afternoon that might fit.",
  window: { label: "this afternoon", from: "2026-11-11T17:00:00.000Z", to: "2026-11-11T22:00:00.000Z" },
  source: "ai",
  results: [
    {
      id: "e1",
      title: "Resume workshop",
      category: "PROFESSIONAL",
      location: "Blackburn Center",
      orgName: "Career Club",
      startsAt: "2026-11-11T18:00:00.000Z",
      endsAt: "2026-11-11T19:00:00.000Z",
      reason: "Get your resume ready before the fair",
    },
    {
      id: "e2",
      title: "Open mic poetry",
      category: "CULTURAL",
      location: null,
      orgName: "Poetry Society",
      startsAt: "2026-11-11T21:30:00.000Z",
      endsAt: "2026-11-11T22:30:00.000Z",
      reason: "Happening this afternoon",
    },
  ],
};

function mockFetch(impl: () => Promise<Partial<Response>>) {
  const fn = jest.fn(impl);
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

function renderChat() {
  render(
    <MemoryRouter initialEntries={["/chat"]}>
      <App />
    </MemoryRouter>,
  );
}

function ask(text: string) {
  fireEvent.change(screen.getByLabelText("Your question"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
}

test("TC-34 a typed question shows matching events", async () => {
  const fetchMock = mockFetch(async () => ({ ok: true, status: 200, json: async () => RESPONSE }));
  renderChat();
  ask("What's happening this afternoon?");

  expect(screen.getByRole("status")).toBeTruthy(); // loading state
  expect(await screen.findByText("Resume workshop")).toBeTruthy();
  expect(screen.getByText("Open mic poetry")).toBeTruthy();
  expect(screen.getByText(RESPONSE.reply)).toBeTruthy();

  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("/api/chat");
  expect(JSON.parse(String(init.body))).toEqual({ message: "What's happening this afternoon?" });
});

test("TC-35 every result shows a reason", async () => {
  mockFetch(async () => ({ ok: true, status: 200, json: async () => RESPONSE }));
  renderChat();
  ask("this afternoon");
  await screen.findByText("Resume workshop");
  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(2);
  for (const item of items) expect(item.textContent).toMatch(/Why: \S+/);
});

test("TC-34 chat shows an error state with retry", async () => {
  mockFetch(async () => ({ ok: false, status: 401, json: async () => ({ error: "Sign in required" }) }));
  renderChat();
  ask("career");
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByText("Sign in required")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
});

test("TC-34 chat shows an empty state when nothing matches", async () => {
  mockFetch(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ ...RESPONSE, reply: "I couldn't find any matching events.", results: [] }),
  }));
  renderChat();
  ask("underwater basket weaving");
  expect(await screen.findByText(/No matching events/)).toBeTruthy();
});
