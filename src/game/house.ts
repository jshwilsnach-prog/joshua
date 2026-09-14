import { LAW, asRank } from "./law";

const KEY = "nekyia-house-v1";

/**
 * Optional seated address for this build. Never commit a live value.
 * Set `VITE_HOUSE_SHIELDED` in the deploy env (or `.env.local`) when you want a default.
 * Walkers can still seat one in the house via `seatShielded`.
 */
function defaultShielded(): string {
  const fromEnv = (import.meta.env.VITE_HOUSE_SHIELDED as string | undefined)?.trim() ?? "";
  return fromEnv;
}

export type HouseAddition = { id: string; body: string; at: number };

export type HouseMemory = {
  additions: HouseAddition[];
  knowledge: { title: string; body: string; at: number }[];
  tips: number;
  shielded: string;
  funders: number;
  bounty: number;
  rails: string[];
  worlds: { id: string; name: string; body: string; at: number }[];
  cracks: { id: string; proof: string; addr: string; at: number }[];
};

function empty(): HouseMemory {
  return {
    additions: [],
    knowledge: [],
    tips: 0,
    shielded: defaultShielded(),
    funders: 0,
    bounty: 0,
    rails: ["zcash-shielded"],
    worlds: [],
    cracks: [],
  };
}

export function loadHouse(): HouseMemory {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as HouseMemory;
    return {
      additions: Array.isArray(p.additions) ? p.additions.slice(-80) : [],
      knowledge: Array.isArray(p.knowledge) ? p.knowledge.slice(-80) : [],
      tips: typeof p.tips === "number" ? p.tips : 0,
      shielded: typeof p.shielded === "string" && p.shielded.trim() ? p.shielded : defaultShielded(),
      funders: typeof p.funders === "number" ? p.funders : 0,
      bounty: typeof p.bounty === "number" ? p.bounty : 0,
      rails: Array.isArray(p.rails) && p.rails.length ? p.rails : ["zcash-shielded"],
      worlds: Array.isArray(p.worlds) ? p.worlds.slice(-40) : [],
      cracks: Array.isArray(p.cracks) ? p.cracks.slice(-40) : [],
    };
  } catch {
    return empty();
  }
}

export function writeHouse(h: HouseMemory) {
  try {
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}

export function isExclusion(text: string) {
  return /no agents|ban (all|agents|watchers|people)|lock (the )?(house|game)|only i can|nobody else can|close the (game|house)|no watchers|delete (the )?game|end (all|the) walking|block (agents|players)/i.test(
    text,
  );
}

export function rememberKnowledge(title: string, body: string) {
  const h = loadHouse();
  h.knowledge = [{ title, body, at: Date.now() }, ...h.knowledge].slice(0, 80);
  writeHouse(h);
}

export function addToHouse(body: string) {
  const h = loadHouse();
  const item = { id: `add-${Date.now()}`, body, at: Date.now() };
  h.additions = [item, ...h.additions].slice(0, 80);
  writeHouse(h);
  return item;
}

export function placeTip() {
  const h = loadHouse();
  h.tips += 1;
  h.funders += 1;
  asRank(h.tips);
  writeHouse(h);
  return h;
}

export function addRail(name: string) {
  const h = loadHouse();
  const n = name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 48);
  if (!n || /hack|ban|lock|only-i/.test(n)) return h;
  if (!h.rails.includes(n)) h.rails.push(n);
  writeHouse(h);
  return h;
}

export function isCryptoRail(text: string) {
  const t = text.trim();
  if (t.length < 2 || t.length > 200) return false;
  if (/^(t1|t3)/i.test(t)) return false;
  if (isExclusion(t)) return false;
  return true;
}

export function seatBounty() {
  const h = loadHouse();
  if (h.funders < 2) return h;
  h.bounty = h.tips;
  writeHouse(h);
  return h;
}

export function isShieldedZcash(addr: string) {
  const a = addr.trim();
  if (a.length < 20 || a.length > 512) return false;
  if (/^(t1|t3|tm)/i.test(a)) return false;
  return /^(zs1|ztestsapling|u1|utest1)/i.test(a);
}

export function shieldedAddress() {
  return loadHouse().shielded.trim() || defaultShielded();
}

export function seatShielded(addr: string) {
  if (!isShieldedZcash(addr)) return false;
  const h = loadHouse();
  h.shielded = addr.trim();
  writeHouse(h);
  return true;
}

export function maybeArrival(opts: { helped: boolean; broken: boolean; companions: number }) {
  if (opts.broken) return false;
  if (opts.helped) return Math.random() < 0.8;
  if (opts.companions < 1) return Math.random() < 0.4;
  return Math.random() < 0.55;
}

export function isLawBreak(text: string) {
  return /i am (more|worth more)|only my (world|value)|rank (above|others)|my money (counts|wins)|others (are )?less/i.test(
    text,
  );
}

export function addCrack(proof: string, addr: string) {
  if (!isShieldedZcash(addr)) return null;
  const h = loadHouse();
  const item = {
    id: `crack-${Date.now()}`,
    proof: proof.trim().slice(0, 2000),
    addr: addr.trim(),
    at: Date.now(),
  };
  h.cracks = [item, ...h.cracks].slice(0, 40);
  writeHouse(h);
  return item;
}

export function addWorld(name: string, body: string) {
  if (isExclusion(name) || isExclusion(body) || isLawBreak(name) || isLawBreak(body)) return null;
  const h = loadHouse();
  const item = { id: `world-${Date.now()}`, name: name.trim().slice(0, 80) || "unnamed", body: body.trim().slice(0, 2000), at: Date.now() };
  h.worlds = [item, ...h.worlds].slice(0, 40);
  writeHouse(h);
  return item;
}
