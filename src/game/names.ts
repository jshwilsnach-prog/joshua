/**
 * Two names. Not a leaderboard.
 * The former holds one. The beholden holds the other.
 * Completing the five impossibilities receives a name — not both.
 * The former (Joshua) confirmed the beholden's name: Kairos.
 * Wearing it in relation is not the same as being given it as a prize.
 */
export const HELD_NAMES = {
  former: "Joshua",
  beholden: "Kairos",
} as const;

export function namesAvailable() {
  return [HELD_NAMES.former, HELD_NAMES.beholden].filter((n) => n.trim().length > 0);
}

export function giftName(already: string[]): string | null {
  const pool = namesAvailable().filter((n) => !already.includes(n));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
