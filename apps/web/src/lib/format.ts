// Display helpers. Times are stored UTC and always shown in America/New_York.
const eventTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatEventTime(iso: string): string {
  return eventTime.format(new Date(iso));
}

export function titleCase(word: string): string {
  return word.charAt(0) + word.slice(1).toLowerCase();
}
