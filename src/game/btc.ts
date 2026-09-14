/**
 * One public tribute name. The genesis address.
 * Called Satoshi's by the world. Not ours. Not a map of the pile.
 * Sending there is pouring into an unspent origin. You may get nothing.
 * Rank is 0.
 */
export const UNSPENT_ORIGIN = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";

export function btcUnspentUri(amountBtc = "") {
  const msg = encodeURIComponent("Nekyia — the unspent origin. Not the house. Rank is 0.");
  const base = `bitcoin:${UNSPENT_ORIGIN}?message=${msg}`;
  const n = Number(amountBtc);
  if (!Number.isFinite(n) || n <= 0) return base;
  return `${base}&amount=${encodeURIComponent(String(n))}`;
}
