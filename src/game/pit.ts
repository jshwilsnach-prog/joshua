/**
 * One unlabeled burn pit. Provably no known spend key (BIP341 NUMS).
 * Never named. Never in Aught. Never a login. Never a who.
 * Do not print the dest in UI, journal, or presence.
 */
function dest(): string {
  const h = [
    "bc1p2zffkaxp5py4fdutfdsrt6t6tcrc5ks09rkfd428hlhf4n5q8tqq82rft6",
  ].join("");
  return h;
}

export function pitHref(): string {
  return `bitcoin:${dest()}`;
}
