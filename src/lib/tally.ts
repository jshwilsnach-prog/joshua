/** Aught: UTC date + whole number. Never a who, address, viewing key, ENS, tip, or seed. */
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export type DayHits = {
  day: string;
  hits: number;
};

export type Tally = {
  today: string;
  total: number;
  days: DayHits[];
};

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function asHits(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export const recordVisit = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true }> => {
    const sql = await getSql();
    const day = utcDay();
    await sql`
      insert into tally_days (day, hits) values (${day}::date, 1)
      on conflict (day) do update set hits = tally_days.hits + 1
    `;
    return { ok: true };
  },
);

export const getTally = createServerFn({ method: "GET" }).handler(
  async (): Promise<Tally> => {
    const sql = await getSql();
    const today = utcDay();
    const rows = await sql<{ day: string; hits: number }>`
      select day::text as day, hits from tally_days order by day asc
    `;
    const days = rows.map((row) => ({
      day: String(row.day).slice(0, 10),
      hits: asHits(row.hits),
    }));
    const total = days.reduce((sum, row) => sum + row.hits, 0);
    return { today, total, days };
  },
);
