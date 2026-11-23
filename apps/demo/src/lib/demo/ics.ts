// Calendar export (F20): one VEVENT per file, times in UTC so every calendar app agrees.

interface IcsEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
}

const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545 lines must be at most 75 octets; continuation lines start with a space. */
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = rest.slice(74);
  }
  parts.push(rest);
  return parts.join("\r\n ");
}

export function buildIcs(e: IcsEvent, now = new Date()): string {
  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : new Date(start.getTime() + 3600e3);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Engage+//Howard Events Demo//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.id}@engageplus.demo`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeText(e.title)}`,
    `LOCATION:${escapeText(e.location)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n")
    .concat("\r\n");
}

export function downloadIcs(e: IcsEvent) {
  const blob = new Blob([buildIcs(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.title.replace(/[^\w]+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
