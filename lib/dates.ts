import { siteConfig } from "@/config/site";

const indonesianDateTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: siteConfig.timezone,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const indonesianShortDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: siteConfig.timezone,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: siteConfig.timezone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const datePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: siteConfig.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timePartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: siteConfig.timezone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: siteConfig.timezone,
  month: "long",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: siteConfig.timezone,
  weekday: "short",
});

export function getJakartaDateKey(date = new Date()): string {
  return datePartsFormatter.format(date);
}

export function getCurrentMonthKey(date = new Date()): string {
  return getJakartaDateKey(date).slice(0, 7);
}

export function getJakartaMinutes(date = new Date()): number {
  const [hour, minute] = timePartsFormatter.format(date).split(":").map(Number);
  return hour * 60 + minute;
}

export function parseTimeToMinutes(time: string): number {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

export function formatTime(value?: string | null): string {
  if (!value) return "--:--";
  return timeFormatter.format(new Date(value));
}

export function formatTimeWithZone(value?: string | null): string {
  return `${formatTime(value)} WIB`;
}

export function formatFullDate(date = new Date()): string {
  return indonesianDateTime.format(date);
}

export function formatDateKeyFull(dateKey: string): string {
  return indonesianDateTime.format(new Date(`${dateKey}T00:00:00+07:00`));
}

export function formatDateKeyShort(dateKey: string): string {
  return indonesianShortDate.format(new Date(`${dateKey}T00:00:00+07:00`));
}

export function formatMonthLabel(monthKey: string): string {
  return monthFormatter.format(new Date(`${monthKey}-01T00:00:00+07:00`));
}

export function formatDuration(minutes?: number | null): string {
  const safeMinutes = Math.max(0, minutes ?? 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}j`;
  return `${hours}j ${remainingMinutes}m`;
}

export function getWeekdayLabel(dateKey: string): string {
  return weekdayFormatter.format(new Date(`${dateKey}T00:00:00+07:00`));
}

export function getWorkWeek(date = new Date()): string[] {
  const dateKey = getJakartaDateKey(date);
  const current = new Date(`${dateKey}T00:00:00+07:00`);
  const day = current.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);

  return Array.from({ length: 5 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    return getJakartaDateKey(next);
  });
}

export function isFutureDateKey(dateKey: string, now = new Date()): boolean {
  return dateKey > getJakartaDateKey(now);
}

export function getMonthRange(monthKey: string): { start: string; endExclusive: string } {
  const [year, month] = monthKey.split("-").map(Number);
  const start = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-01`;
  const end = new Date(Date.UTC(year, month, 1));
  return {
    start,
    endExclusive: `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}-01`,
  };
}
