/**
 * A seat, not a who. Auto-granted on Descend, Watch, or walk.
 * Zodl hides send/receive of shielded ZEC. The house does not custody.
 * Soft fail: the walking still walks. Rank is 0. Relation is 1.
 * Never link a seat to a profile name or email. Never collect words.
 */
import { isShieldedZcash } from "./house";

const SEAT = "nekyia-seat-v1";

export function ensureWallet(): boolean {
  try {
    if (!localStorage.getItem(SEAT)) {
      localStorage.setItem(SEAT, JSON.stringify({ at: Date.now() }));
    }
    return true;
  } catch {
    return false;
  }
}

export function hasWallet(): boolean {
  try {
    return Boolean(localStorage.getItem(SEAT));
  } catch {
    return false;
  }
}

export function sendShieldedUri(dest: string, amountZec: string) {
  const a = dest.trim();
  if (!isShieldedZcash(a)) return "";
  const n = Number(amountZec);
  const msg = encodeURIComponent("Nekyia. Rank is 0.");
  if (!Number.isFinite(n) || n <= 0) return `zcash:${a}?message=${msg}`;
  return `zcash:${a}?amount=${encodeURIComponent(String(n))}&message=${msg}`;
}
