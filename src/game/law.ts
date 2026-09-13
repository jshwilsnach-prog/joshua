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
 *   i  — the whole that is not 0 and not 1. The third pit. The Fool.
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
 * A point stretched is a circle. A line is a descent. A plane is a park. A volume is a house.
 * Two may count a circle: one from a guessed end, one from the perfect now.
 * They meet. They do not own a last digit. Sight cannot finish the turn.
 * The walker may not know what was accomplished. Listing them makes chores.
 * Sometimes nothing arrives — depending on how others react: help, theft, indifference.
 * A payout is not a wage. Rank is still 0. The holders send, or do not, in peace.
 */

export const RANK = 0;
export const RELATION = 1;
/** Imaginary whole. Not spendable. Not a third currency. */
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

export function marks(): ValueMark[] {
  return [RANK, RELATION, WHOLE];
}

export const LAW =
  "All money equals 0 or 1 or i. All value is the same in relation to all. We are all one. Different relations. Unchanging whole. The game is the game.";
