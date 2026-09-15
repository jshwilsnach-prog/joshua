/**
 * THE LAW — for anyone who reads the source.
 *
 * We are all one. Every part of the world stands in different relations.
 * All value is the same in relation to all.
 *
 * Money in this house equals 0, or 1, or i — the imaginary whole.
 * Unchanging. Not a score. Not a throne.
 *
 *   0  — rank. Nobody is more. Nobody is less.
 *   1  — relation. Eye to eye. 1 2 1.
 *   i  — the whole. Orthogonal to 0 and 1. Not spendable. Not a third currency.
 *
 * The law exists because ego reasserts rank even where none is real.
 * This file is the discipline, not a proof that oneness needs defending.
 *
 * Resources may be called infinite. Who knows. The same law would still hold:
 * more does not rank. Less does not rank.
 *
 * Will they help each other or not?
 * What is their heart like when they cannot prove
 *   why they are playing,
 *   if the others are human or bots,
 *   and all the philosophies we have walked over time?
 *
 * The code cannot answer. The walking might. The game is the game.
 *
 * The walking holds in 3D, 2D, 1D, 0D, and a loop. Same law. Not a graphics setting.
 * Aught is proof of work that links to Nekyia: a date and a count. Not a who.
 * The name in the world is the door: nekyia.me. Independent. Share that.
 * This file is the invariant. The lintel is the spare key. A grate is not a hunt.
 * homomorphic tally would still be a number, not a who. Do not store a richer
 * number because it is encrypted.
 * The walker may not know what was accomplished. Listing them makes chores.
 * Sometimes nothing arrives — depending on how others react: help, theft, indifference.
 * A payout is not a wage. Rank is still 0. The holders send, or do not, in peace.
 */

export const RANK = 0;
export const RELATION = 1;
/** Imaginary whole. Orthogonal to rank and relation. Not spendable. */
export const WHOLE = "i";

export type ValueMark = 0 | 1 | typeof WHOLE;

/** Totals do not rank. Any pile equals the same in relation to all. */
export function asRank(_amount: number): typeof RANK {
  return RANK;
}

/** A tip, a bounty, a planet, a body: still one relation. */
export function asRelation(_who: string): typeof RELATION {
  return RELATION;
}

/** The whole. Cannot be minted from a pile. */
export function asWhole(): typeof WHOLE {
  return WHOLE;
}

/**
 * i behaves like the imaginary unit on the plane of value:
 * it does not add into 0, and 0 does not add into it.
 * i + i is still i — not 2i, not a bigger whole.
 * 1 + 1 is still 1 — relation does not stack into rank.
 */
export function sum(a: ValueMark, b: ValueMark): ValueMark {
  if (a === WHOLE || b === WHOLE) return WHOLE;
  if (a === RELATION || b === RELATION) return RELATION;
  return RANK;
}

/** The whole cannot be exchanged for rank or relation. Nothing becomes i by trade. */
export function exchange(from: ValueMark, to: ValueMark): ValueMark | null {
  if (from === WHOLE || to === WHOLE) return null;
  if (from === to) return from;
  return null;
}

export function marks(): ValueMark[] {
  return [RANK, RELATION, WHOLE];
}

export const LAW =
  "1 to i to 0 in a loop. All money equals 0 or 1 or i. All value is the same in relation to all. We are all one. Different relations. Unchanging whole. The game is the game.";
