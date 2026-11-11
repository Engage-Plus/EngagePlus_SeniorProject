import { fireEvent, render, screen } from "@testing-library/react";
import type { PendingFeedbackResponse } from "@engageplus/shared";
import { FeedbackPrompt } from "./FeedbackPrompt";

const PENDING: PendingFeedbackResponse = {
  events: [
    {
      id: "e1",
      title: "Resume workshop",
      orgName: "Career Club",
      startsAt: "2026-11-11T18:00:00.000Z",
      endsAt: "2026-11-11T19:00:00.000Z",
    },
  ],
};

type Handler = (url: string, init?: RequestInit) => Partial<Response>;
const json = (status: number, body: unknown): Partial<Response> => ({
  ok: status < 400,
  status,
  json: async () => body,
});

function mockFetch(handler: Handler) {
  const fn = jest.fn(async (url: string, init?: RequestInit) => handler(url, init));
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

test("TC-05 prompt appears for an ended RSVP'd event and the rating saves", async () => {
  const fetchMock = mockFetch((url) =>
    url === "/api/feedback/pending" ? json(200, PENDING) : json(200, { eventId: "e1", thumbsUp: true }),
  );
  render(<FeedbackPrompt />);

  expect(await screen.findByText("Resume workshop")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Thumbs up" }));

  expect(await screen.findByText(/Thanks!/)).toBeTruthy();
  expect(screen.queryByText("Resume workshop")).toBeNull();
  const [url, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
  expect(url).toBe("/api/feedback/e1");
  expect(init.method).toBe("POST");
  expect(JSON.parse(String(init.body))).toEqual({ thumbsUp: true });
});

test("TC-05 no prompt when nothing is pending or the user is signed out", async () => {
  mockFetch(() => json(200, { events: [] }));
  const { container, unmount } = render(<FeedbackPrompt />);
  await new Promise((r) => setTimeout(r, 0));
  expect(container.textContent).toBe("");
  unmount();

  mockFetch(() => json(401, { error: "Sign in required" }));
  const signedOut = render(<FeedbackPrompt />);
  await new Promise((r) => setTimeout(r, 0));
  expect(signedOut.container.textContent).toBe("");
});

test("TC-05 a failed save shows an inline error and keeps the prompt", async () => {
  mockFetch((url) => (url === "/api/feedback/pending" ? json(200, PENDING) : json(409, { error: "You can rate this event after it ends" })));
  render(<FeedbackPrompt />);
  fireEvent.click(await screen.findByRole("button", { name: "Thumbs down" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByText(/after it ends/)).toBeTruthy();
  expect(screen.getByText("Resume workshop")).toBeTruthy();
});
