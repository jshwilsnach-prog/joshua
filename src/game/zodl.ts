import { isShieldedZcash } from "./house";

/**
 * Zodl is Zashi. ZODL is Zcash Open Development Lab — the flagship
 * shielded wallet. The house does not custody. Rank is still 0.
 *
 * We do not vendor their app. Players restore 24 words in Zodl to
 * receive and send. Transparent names (t1, t3) are refused.
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

export const ZODL_SITE = ZODL.site;
export const ZODL_IOS = ZODL.ios;
export const ZODL_ANDROID = ZODL.android;

export function zip321(addr: string, message = "Nekyia — a walking. Rank is 0.") {
  const a = addr.trim();
  if (!isShieldedZcash(a)) return "";
  return `zcash:${a}?message=${encodeURIComponent(message)}`;
}

/** Open Zodl, or a ZIP-321 URI. Not a throne. Walking is not gated. */
export function openZodl(href?: string) {
  const raw = (href ?? ZODL.site).trim();
  if (!raw) return;
  const ok =
    raw.startsWith("zcash:") ||
    raw === ZODL.site ||
    raw.startsWith(`${ZODL.site}/`) ||
    raw.startsWith("https://www.zodl.com") ||
    raw.startsWith(ZODL.ios) ||
    raw.startsWith("https://apps.apple.com/app/zodl/id6444974742") ||
    raw.startsWith(ZODL.android) ||
    raw.startsWith(ZODL.fdroid);
  if (!ok) return;
  try {
    if (raw.startsWith("zcash:")) {
      window.location.assign(raw);
      return;
    }
    window.open(raw, "_blank", "noopener,noreferrer");
  } catch {
    /* ignore */
  }
}

export { isShieldedZcash };
