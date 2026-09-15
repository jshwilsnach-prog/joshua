/**
 * Aught on this house: GET/POST /api/aught.
 * Same contract as TALLY.md. No Postgres. No aught.grok.me.
 */

export type DayHits = { day: string; hits: number };
export type Tally = { today: string; total: number; days: DayHits[] };

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function empty(): Tally {
  return { today: utcDay(), total: 0, days: [] };
}

export async function recordVisit(): Promise<{ ok: boolean }> {
  try {
    const r = await fetch("/api/aught", { method: "POST" });
    if (!r.ok) return { ok: false };
    const j = (await r.json()) as { ok?: boolean };
    return { ok: Boolean(j.ok) };
  } catch {
    return { ok: false };
  }
}

export async function getTally(): Promise<Tally> {
  try {
    const r = await fetch("/api/aught");
    if (!r.ok) return empty();
    const j = (await r.json()) as Tally;
    const today = typeof j.today === "string" ? j.today : utcDay();
    const days = Array.isArray(j.days)
      ? j.days
          .map((d) => ({
            day: String(d.day).slice(0, 10),
            hits: Number.isFinite(Number(d.hits)) ? Number(d.hits) : 0,
          }))
          .filter((d) => d.day)
      : [];
    const total = Number.isFinite(Number(j.total)) ? Number(j.total) : days.reduce((s, d) => s + d.hits, 0);
    return { today, total, days };
  } catch {
    return empty();
  }
}
