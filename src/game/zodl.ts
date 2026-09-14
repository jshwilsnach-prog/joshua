/**
 * Zodl (formerly Zashi) is a shielded Zcash lantern, not a browser plug.
 * We do not hold keys. Connecting is opening their door.
 * ZIP-321: zcash:<shielded>?message=...
 * Transparent is refused. Rank is 0.
 */

export const ZODL_SITE = "https://zodl.com";
export const ZODL_IOS = "https://apps.apple.com/app/zodl/id6444974742";
export const ZODL_ANDROID = "https://play.google.com/store/apps/details?id=co.electriccoin.zcash";

export function zip321(addr: string, message = "Nekyia — a walking. Rank is 0.") {
  const a = addr.trim();
  if (!a) return "";
  if (/^(t1|t3|tm)/i.test(a)) return "";
  if (!/^(zs1|ztestsapling|u1|utest1)/i.test(a)) return "";
  return `zcash:${a}?message=${encodeURIComponent(message)}`;
}

export function openZodl(href: string) {
  if (!href) return;
  if (href.startsWith("zcash:") || href.startsWith("bitcoin:")) {
    window.location.assign(href);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}

