import type { DayHits } from "@/lib/tally";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatDay(day: string): string {
  const [, month, date] = day.split("-");
  const m = Number(month);
  const d = Number(date);
  if (!m || !d) return day;
  return `${d} ${MONTHS[m - 1]}`;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}

export function rangeDays(
  today: string,
  count: number,
  rows: DayHits[],
): DayHits[] {
  const map = new Map(rows.map((row) => [row.day, row.hits]));
  const end = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(end)) return [];
  const out: DayHits[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const ms = end - i * 86_400_000;
    const key = new Date(ms).toISOString().slice(0, 10);
    out.push({ day: key, hits: map.get(key) ?? 0 });
  }
  return out;
}

export function sumHits(rows: DayHits[]): number {
  return rows.reduce((sum, row) => sum + row.hits, 0);
}
