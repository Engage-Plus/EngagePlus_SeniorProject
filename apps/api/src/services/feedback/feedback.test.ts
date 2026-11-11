import { HttpError } from "../../middleware/errors.js";
import { listPendingFeedback, MAX_PENDING, submitFeedback } from "./index.js";
import { memoryRepo, NOW } from "./fixtures.js";

const now = () => NOW;
const pendingIds = async (m: ReturnType<typeof memoryRepo>, user = "u1") =>
  (await listPendingFeedback(user, { repo: m.repo, now })).map((e) => e.id);

test("TC-05 prompt appears after the end time, not before", async () => {
  const m = memoryRepo();
  m.addEvent("ended", 1, ["u1"]);
  m.addEvent("ongoing", -1, ["u1"]); // ends in an hour
  m.addEvent("tomorrow", -24, ["u1"]);
  expect(await pendingIds(m)).toEqual(["ended"]);
});

test("TC-05 prompt only for the student's own RSVPs, unrated, and recent", async () => {
  const m = memoryRepo();
  m.addEvent("mine", 2, ["u1"]);
  m.addEvent("not-rsvped", 2, ["u2"]);
  m.addEvent("old", 24 * 15, ["u1"]); // ended 15 days ago
  m.addEvent("rated", 3, ["u1"]);
  await submitFeedback("u1", "rated", true, { repo: m.repo, now });

  expect(await pendingIds(m)).toEqual(["mine"]);
  expect(await pendingIds(m, "u2")).toEqual(["not-rsvped"]);
});

test("TC-05 pending list is most recent first and capped", async () => {
  const m = memoryRepo();
  for (const h of [5, 1, 9, 3, 7]) m.addEvent(`e${h}`, h, ["u1"]);
  const ids = await pendingIds(m);
  expect(ids).toHaveLength(MAX_PENDING);
  expect(ids).toEqual(["e1", "e3", "e5"]);
});

test("TC-05 the rating saves and can be changed", async () => {
  const m = memoryRepo();
  m.addEvent("e", 1, ["u1"]);
  await submitFeedback("u1", "e", true, { repo: m.repo, now });
  expect(m.rating("u1", "e")).toBe(true);
  await submitFeedback("u1", "e", false, { repo: m.repo, now });
  expect(m.rating("u1", "e")).toBe(false);
  expect(await pendingIds(m)).toEqual([]); // prompt goes away once rated
});

test.each([
  ["unknown event", "nope", 404],
  ["no RSVP", "other", 403],
  ["not ended yet", "future", 409],
])("TC-05 rating is refused for %s", async (_label, eventId, status) => {
  const m = memoryRepo();
  m.addEvent("other", 1, ["u2"]);
  m.addEvent("future", -2, ["u1"]);
  const err = await submitFeedback("u1", eventId, true, { repo: m.repo, now }).catch((e: unknown) => e);
  expect(err).toBeInstanceOf(HttpError);
  expect((err as HttpError).status).toBe(status);
});
