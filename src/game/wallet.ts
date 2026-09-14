/**
 * A walker's shielded wallet. Created once, on first enter.
 * The house does not custody. Seed never leaves this device. Rank is 0.
 *
 * Receive / send of shielded ZEC: restore the same 24 words in Zodl
 * (the proving engine). ZIP-321 opens Zodl to spend. Transparent refused.
 *
 * WebZjs keys (WASM) may encode a unified full viewing key. A payment
 * address (u1) is not invented here — Zodl Receive, then seat.
 */
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { isShieldedZcash } from "./house";
import { zip321, ZODL_SITE } from "./zodl";

const KEY = "nekyia-wallet-v1";

export type WalkerWallet = {
  mnemonic: string;
  createdAt: number;
  revealed: boolean;
  ufvk: string;
};

function empty(): WalkerWallet {
  return { mnemonic: "", createdAt: 0, revealed: false, ufvk: "" };
}

export function loadWallet(): WalkerWallet {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as WalkerWallet;
    if (typeof p.mnemonic !== "string" || !p.mnemonic.trim()) return empty();
    return {
      mnemonic: p.mnemonic.trim(),
      createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
      revealed: Boolean(p.revealed),
      ufvk: typeof p.ufvk === "string" ? p.ufvk : "",
    };
  } catch {
    return empty();
  }
}

function writeWallet(w: WalkerWallet) {
  try {
    localStorage.setItem(KEY, JSON.stringify(w));
  } catch {
    /* ignore */
  }
}

export function hasWallet() {
  return Boolean(loadWallet().mnemonic);
}

/** Create once. CSPRNG 24-word BIP39. Not the WASM test generator. */
export function ensureWallet(): WalkerWallet {
  const existing = loadWallet();
  if (existing.mnemonic) return existing;
  const mnemonic = generateMnemonic(wordlist, 256);
  const w: WalkerWallet = { mnemonic, createdAt: Date.now(), revealed: false, ufvk: "" };
  writeWallet(w);
  void tryUfvk(w);
  return w;
}

export function restoreWallet(phrase: string): WalkerWallet | null {
  const mnemonic = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  if (!validateMnemonic(mnemonic, wordlist)) return null;
  const w: WalkerWallet = { mnemonic, createdAt: Date.now(), revealed: true, ufvk: "" };
  writeWallet(w);
  void tryUfvk(w);
  return w;
}

export function markRevealed() {
  const w = loadWallet();
  if (!w.mnemonic) return w;
  w.revealed = true;
  writeWallet(w);
  return w;
}

export function showWordsAgain() {
  const w = loadWallet();
  if (!w.mnemonic) return w;
  w.revealed = false;
  writeWallet(w);
  return w;
}

export function forgetWallet() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

async function tryUfvk(w: WalkerWallet) {
  try {
    const mod = await import("@chainsafe/webzjs-keys");
    await mod.default();
    const seed = mnemonicToSeedSync(w.mnemonic);
    const usk = new mod.UnifiedSpendingKey("main", seed, 0);
    const ufvk = usk.to_unified_full_viewing_key().encode("main");
    const next = loadWallet();
    if (next.mnemonic !== w.mnemonic) return;
    next.ufvk = ufvk;
    writeWallet(next);
    usk.free();
  } catch {
    /* keys wasm is optional. Zodl still proves. */
  }
}

export function sendShieldedUri(dest: string, amountZec: string) {
  const a = dest.trim();
  if (!isShieldedZcash(a)) return "";
  const n = Number(amountZec);
  if (!Number.isFinite(n) || n <= 0) return zip321(a, "Nekyia — a walking. Rank is 0.");
  const amt = String(n);
  return `zcash:${a}?amount=${encodeURIComponent(amt)}&message=${encodeURIComponent("Nekyia. Rank is 0.")}`;
}

export function zodlRestoreHref() {
  return ZODL_SITE;
}

export function walletWords(): string {
  return loadWallet().mnemonic;
}
