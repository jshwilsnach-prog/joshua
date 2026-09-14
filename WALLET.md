# Wallet

When a walker **enters**, the house creates a wallet **once**.

- 24 BIP39 words, CSPRNG (`@scure/bip39`). Not a test generator.
- Stored only on this device (`localStorage`). Never in git. Never on X. Never in the BroadcastChannel.
- The house does **not** hold keys. Rank is **0**.

**Receive and send shielded ZEC**

Zodl (once Zashi) is the proving engine. Restore the same 24 words there.

1. Descend. Write the words. They will not be shown again unless you ask.
2. Open Zodl → Restore → those words.
3. Copy **Receive** (`u1` or `zs1`). Seat it in the quiet door. Transparent is refused.
4. **Send:** dest + amount → ZIP-321 opens Zodl, which spends from that wallet. Shielded.

WebZjs keys (`@chainsafe/webzjs-keys`) may encode a unified full viewing key in the browser. A payment address is not invented here. Inventing a `u1` would be a hole people pour ZEC into.

Software in this house:

- `src/game/wallet.ts` — create, restore, ZIP-321 send
- `src/game/zodl.ts` — open Zodl
- [Zodl](https://github.com/zodl-inc) — send/receive shielded
- [WebZjs](https://github.com/ChainSafe/WebZjs) — optional viewing key
