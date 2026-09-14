import { isShieldedZcash } from "./house";

/**
 * Zodl is Zashi. ZODL is Zcash Open Development Lab — the team that built
 * the flagship shielded wallet. The house does not hold a seed. Rank is still 0.
 *
 * We do not vendor their app. Players receive in their own wallet.
 * Transparent names (t1, t3) are refused.
 */
export const ZODL = {
  name: "Zodl",
  once: "Zashi",
  lab: "Zcash Open Development Lab",
  site: "https://zodl.com",
  ios: "https://apps.apple.com/app/id6444974742",
  android: "https://play.google.com/store/apps/details?id=co.electriccoin.zcash",
  fdroid: "https://f-droid.org/packages/co.electriccoin.zcash.foss/",
} as const;

export function zip321(addr: string, memo?: string) {
  const a = addr.trim();
  if (!isShieldedZcash(a)) return "";
  if (memo?.trim()) return `zcash:${a}?memo=${encodeURIComponent(memo.trim().slice(0, 512))}`;
  return `zcash:${a}`;
}

export { isShieldedZcash };
