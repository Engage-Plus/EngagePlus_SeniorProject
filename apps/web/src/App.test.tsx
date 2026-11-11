import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "./App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function mockFetch(impl: () => Promise<Partial<Response>>) {
  const fn = jest.fn(impl);
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

test("TC-52 web app renders the shell and shows the API online", async () => {
  const fetchMock = mockFetch(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ status: "ok", service: "engageplus-api", time: new Date().toISOString() }),
  }));
  renderAt("/");
  expect(screen.getByText("Engage+")).toBeTruthy();
  expect(screen.getByRole("status")).toBeTruthy(); // loading state first
  expect(await screen.findByText("API online")).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith("/api/health", expect.anything());
});

test("TC-52 web app shows an error state when the API is down", async () => {
  mockFetch(async () => Promise.reject(new TypeError("network")));
  renderAt("/");
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByText(/Can't reach Engage\+/)).toBeTruthy();
});

test("TC-52 unknown routes show the not-found page", () => {
  mockFetch(async () => ({ ok: true, status: 200, json: async () => ({}) }));
  renderAt("/nope");
  expect(screen.getByText("Page not found")).toBeTruthy();
});
