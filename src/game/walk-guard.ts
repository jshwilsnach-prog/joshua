/** Steal, trick, spirit, help: a body in reach, then a pause. Not a who. */

export const REACH = 3.2;
export const TAKE_MS = 8000;

export function isNear(px: number, pz: number, x: number, z: number) {
  return Math.hypot(x - px, z - pz) <= REACH;
}

export function canTake(last: number, now: number, wait = TAKE_MS) {
  return now - last >= wait;
}
