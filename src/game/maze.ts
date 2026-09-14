import type { Chamber, Prop, Wall } from "./types";

export const PLAYER_START = { x: 0, y: 1.62, z: 108, yaw: 0, pitch: 0 };

export const SAUCER = { x: 0, z: 108, r: 15 };

export const PLANETS = [
  { id: "saucer", x: 0, z: 108, r: 15, fog: "#071018", light: "#e8f4ff" },
  { id: "saucer-b", x: 46, z: 108, r: 13, fog: "#180c08", light: "#ffb080" },
  { id: "saucer-c", x: -46, z: 108, r: 14, fog: "#0a0814", light: "#c8b0ff" },
] as const;

const H = 4.6;
const T = 0.62;
const W = 3.7;

function box(x: number, z: number, w: number, d: number, extra?: Partial<Wall>): Wall {
  return { x, z, w, d, h: H, ...extra };
}

function hall(x1: number, z1: number, x2: number, z2: number, extra?: Partial<Wall>): Wall[] {
  const walls: Wall[] = [];
  const horiz = Math.abs(z1 - z2) < 0.2;
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const len = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  const hw = W / 2;
  if (horiz) {
    walls.push(box(cx, cz - hw, len + T, T, extra));
    walls.push(box(cx, cz + hw, len + T, T, extra));
  } else {
    walls.push(box(cx - hw, cz, T, len + T, extra));
    walls.push(box(cx + hw, cz, T, len + T, extra));
  }
  return walls;
}

function manhattan(x1: number, z1: number, x2: number, z2: number, extra?: Partial<Wall>): Wall[] {
  if (Math.abs(x1 - x2) < 0.2 || Math.abs(z1 - z2) < 0.2) {
    return hall(x1, z1, x2, z2, extra);
  }
  // Prefer north/south first so the path feels like a descent.
  return [...hall(x1, z1, x1, z2, extra), ...hall(x1, z2, x2, z2, extra)];
}

function ring(cx: number, cz: number, r: number, openings: number[] = []): Wall[] {
  const segs = 24;
  const walls: Wall[] = [];
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    const open = openings.some((a) => {
      let d = Math.abs(mid - a);
      d = Math.min(d, Math.PI * 2 - d);
      return d < 0.28;
    });
    if (open) continue;
    const x = cx + Math.cos(mid) * r;
    const z = cz + Math.sin(mid) * r;
    const w = r * (a1 - a0) * 1.12;
    walls.push({
      x,
      z,
      w: Math.abs(Math.cos(mid)) > 0.7 ? T : w,
      d: Math.abs(Math.sin(mid)) > 0.7 ? T : w,
      h: H,
    });
  }
  return walls;
}

export const CHAMBERS: Chamber[] = [
  {
    id: "saucer",
    name: "",
    x: 0,
    z: 108,
    r: 16,
    fog: "#071018",
    light: "#e8f4ff",
    whisper: "",
  },
  {
    id: "saucer-b",
    name: "",
    x: 46,
    z: 108,
    r: 14,
    fog: "#180c08",
    light: "#ffb080",
    whisper: "",
  },
  {
    id: "saucer-c",
    name: "",
    x: -46,
    z: 108,
    r: 15,
    fog: "#0a0814",
    light: "#c8b0ff",
    whisper: "",
  },
  {
    id: "vestibule",
    name: "A Threshold",
    x: 0,
    z: 86,
    r: 8.5,
    fog: "#14110e",
    light: "#cfc6b6",
    whisper: "You arrived wearing a name.",
  },
  {
    id: "faces",
    name: "The House of Faces",
    x: 0,
    z: 62,
    r: 7.2,
    fog: "#17140f",
    light: "#d2c4a4",
    whisper: "Every room you have ever entered, you entered as someone.",
  },
  {
    id: "attic",
    name: "Rooms Above the House",
    x: -22,
    z: 62,
    r: 6.8,
    fog: "#121014",
    light: "#a8b0c0",
    whisper: "What you forgot did not forget you.",
  },
  {
    id: "twin",
    name: "The Other Step",
    x: 0,
    z: 40,
    r: 7.6,
    fog: "#100c0c",
    light: "#8a3a3a",
    whisper: "Someone has been walking one pace behind you.",
  },
  {
    id: "nightsea",
    name: "Black Water",
    x: 24,
    z: 40,
    r: 7.0,
    fog: "#0c1016",
    light: "#6e88aa",
    whisper: "The descent is not down. It is in.",
  },
  {
    id: "orchard",
    name: "The Unnamed Grove",
    x: -26,
    z: 40,
    r: 8.4,
    fog: "#10140f",
    light: "#c5c8b4",
    whisper: "A figure waits who is not you, and not anyone else either.",
  },
  {
    id: "crossroads",
    name: "Four Ways, None Marked",
    x: 12,
    z: 26,
    r: 5.8,
    fog: "#141210",
    light: "#c4b48a",
    whisper: "A laugh without a throat.",
  },
  {
    id: "hall",
    name: "The Gallery of Images",
    x: 22,
    z: 12,
    r: 10.5,
    fog: "#16120e",
    light: "#e0d2b4",
    whisper: "They were never yours. You only hosted them.",
  },
  {
    id: "vessel",
    name: "The Closed Work",
    x: -20,
    z: 14,
    r: 7.4,
    fog: "#120f0c",
    light: "#b09060",
    whisper: "Lead and gold are the same metal, arguing.",
  },
  {
    id: "pillars",
    name: "Two Stones",
    x: 0,
    z: 16,
    r: 7.0,
    fog: "#141416",
    light: "#d8d8e4",
    whisper: "If you choose, the other will return as fate.",
  },
  {
    id: "center",
    name: "A Quiet Circle",
    x: 0,
    z: 0,
    r: 11,
    fog: "#0e0d10",
    light: "#efe6d4",
    whisper: "You are not this. You are the one who can see this.",
  },
  {
    id: "workshop",
    name: "The Worktable",
    x: 0,
    z: -22,
    r: 6.8,
    fog: "#120e0b",
    light: "#e6c99a",
    whisper: "Someone has been here the whole time, and could not leave the table.",
  },
  {
    id: "philemon",
    name: "A Porch of Wings",
    x: 36,
    z: 12,
    r: 6.2,
    fog: "#101816",
    light: "#7aa8a0",
    whisper: "Called or uncalled, the god will be there.",
  },
  {
    id: "bollingen",
    name: "A Tower of Stones",
    x: -38,
    z: 62,
    r: 5.6,
    fog: "#12110e",
    light: "#c2b49a",
    whisper: "He built this so the dead would have a house.",
  },
  {
    id: "stacks",
    name: "The Bound World",
    x: 22,
    z: 62,
    r: 7.0,
    fog: "#12141a",
    light: "#c4c0b0",
    whisper: "Every religion, every proof, every poem — the day-world, bound. This is the floor, not a detour.",
  },
];

export const PROPS: Prop[] = [
  { id: "saucer", kind: "relic", x: 0, z: 108, label: "A floor that answers" },
  { id: "saucer-b", kind: "relic", x: 46, z: 108, label: "A floor that answers" },
  { id: "saucer-c", kind: "relic", x: -46, z: 108, label: "A floor that answers" },
  { id: "porter", kind: "figure", x: -2.2, z: 82.5, portrait: "porter", label: "The keeper of the hook" },
  { id: "maskhook", kind: "relic", x: 2.4, z: 82.8, label: "A wooden hook", y: 1.2 },
  { id: "faces-echo", kind: "figure", x: 0, z: 60.2, portrait: "mask", label: "A wall of faces", scale: 1.15 },
  { id: "attic-chest", kind: "relic", x: -22, z: 59.4, label: "A box of unsent letters" },
  { id: "window", kind: "relic", x: -18.4, z: 58.2, label: "A small window" },
  { id: "twin", kind: "figure", x: 0, z: 37.4, portrait: "twin", label: "The one who kept what you dropped" },
  { id: "nightsea-figure", kind: "figure", x: 24, z: 37.6, portrait: "soul", label: "Someone standing in the water" },
  { id: "hearth", kind: "figure", x: -29.4, z: 37.2, portrait: "mother", label: "A figure by a hearth" },
  { id: "mirror", kind: "figure", x: -26, z: 35.2, portrait: "soul", label: "A figure in a glass" },
  { id: "chapel", kind: "figure", x: -22.4, z: 37.2, portrait: "wise", label: "A figure who does not preach" },
  { id: "mapper", kind: "figure", x: -24.2, z: 39.1, portrait: "soul", label: "Someone still mapping" },
  { id: "psyche-map", kind: "relic", x: -23.2, z: 38.4, label: "Lines that are not a key" },
  { id: "well", kind: "figure", x: -26, z: 43.6, portrait: "soul", label: "A figure at a well" },
  { id: "trickster", kind: "figure", x: 12, z: 24.2, portrait: "trickster", label: "A grin with no owner" },
  { id: "mother", kind: "figure", x: 18.2, z: 8.4, portrait: "mother", label: "The deep well" },
  { id: "wise", kind: "figure", x: 26.4, z: 12, portrait: "wise", label: "The lantern" },
  { id: "child", kind: "figure", x: 22, z: 16.8, portrait: "child", label: "What was left in the grass" },
  { id: "hero", kind: "figure", x: 22, z: 7.4, portrait: "hero", label: "An empty suit of gilt" },
  { id: "vessel-stone", kind: "relic", x: -20, z: 14, label: "A vessel of two metals" },
  { id: "sun-pillar", kind: "relic", x: -2.3, z: 16, label: "A warm stone" },
  { id: "moon-pillar", kind: "relic", x: 2.3, z: 16, label: "A cold stone" },
  { id: "self", kind: "figure", x: 0, z: 0, portrait: "wise", label: "The circle", scale: 0.15 },
  { id: "oculus", kind: "relic", x: 0.8, z: 1.4, label: "A hole in the roof" },
  { id: "creator", kind: "figure", x: -1.8, z: -23.6, portrait: "creator", label: "The one at the table", scale: 1.05 },
  { id: "destroyer", kind: "figure", x: 1.8, z: -23.6, portrait: "destroyer", label: "The one who takes the rooms down", scale: 1.0 },
  { id: "abraxas", kind: "figure", x: 0, z: -21.2, portrait: "abraxas", label: "A fullness", scale: 1.12 },
  { id: "pit", kind: "relic", x: -2.8, z: -21.6, label: "A pit" },
  { id: "aught", kind: "relic", x: -3.8, z: -19.6, label: "Aught — the count, not the who" },
  { id: "crack", kind: "relic", x: -1.1, z: -19.8, label: "A crack — if the law cannot sit with itself" },
  { id: "philemon", kind: "figure", x: 36, z: 10.6, portrait: "wise", label: "A man with kingfisher wings", sync: [5, 6, 7] },
  { id: "bollingen", kind: "relic", x: -38, z: 62, label: "A carved stone" },
  { id: "pebble", kind: "relic", x: -20.8, z: 16.6, label: "An ordinary pebble" },
  { id: "plaque", kind: "relic", x: 3.4, z: 78.8, label: "A lintel carving" },
  { id: "typewriter", kind: "relic", x: -24.6, z: 64.4, label: "A typewriter that is not yours" },
  { id: "serpent", kind: "symbol", x: 4.6, z: 40, label: "A coiled form", symbolId: "serpent" },
  { id: "tree", kind: "symbol", x: -26, z: 40, label: "A tree that is also a person", symbolId: "tree" },
  { id: "water", kind: "symbol", x: 26.8, z: 42.2, label: "A bowl of black water", symbolId: "water" },
  { id: "gold", kind: "symbol", x: -18.2, z: 12.2, label: "A dull yellow lump", symbolId: "gold" },
  { id: "house", kind: "symbol", x: 2.8, z: 62, label: "A tiny house", symbolId: "house" },
  { id: "child-symbol", kind: "symbol", x: 20.2, z: 16.8, label: "A wooden horse", symbolId: "child" },
  { id: "blacksun", kind: "symbol", x: -22.4, z: 14, label: "A sun that gives no light", symbolId: "blacksun" },
  { id: "scarab", kind: "symbol", x: -18.4, z: 57.2, label: "A beetle at the glass", symbolId: "scarab", sync: [3, 4] },
  { id: "clock", kind: "symbol", x: 14.4, z: 26, label: "A clock with no hands", symbolId: "clock" },
  { id: "feather", kind: "symbol", x: 36, z: 13.6, label: "A kingfisher feather", symbolId: "feather", sync: [5, 6, 7] },
  { id: "inner-gate", kind: "gate", x: 0, z: 51.2, label: "The way down", gate: "persona" },
  { id: "center-gate", kind: "gate", x: 0, z: 8.6, label: "The last ring", gate: "center" },
  { id: "workshop-gate", kind: "gate", x: 0, z: -10.4, label: "A door that is not a door", gate: "workshop" },
  { id: "counting-stone", kind: "relic", x: -20, z: 11.4, label: "A stone with two marks" },
  { id: "star-unconstruct", kind: "relic", x: -21.4, z: 12.6, label: "A star that will not construct" },
  { id: "circle-counts", kind: "relic", x: -18.6, z: 12.6, label: "Two counts on a circle" },
  { id: "blank-idea", kind: "relic", x: -26, z: 40, label: "A page with no writing" },
  { id: "philosophy", kind: "relic", x: 2.6, z: 84.2, label: "A page that is yours" },
  { id: "a-world", kind: "relic", x: 5.2, z: 84.8, label: "A world that is yours" },
  { id: "keys", kind: "relic", x: -2.8, z: 84.0, label: "An empty hook for keys" },
  { id: "spare-stone", kind: "relic", x: 4.2, z: 82.6, label: "A spare stone" },
  { id: "shelves", kind: "relic", x: 22, z: 62, label: "Shelves that go on" },
  { id: "book-tanakh", kind: "relic", x: 19.2, z: 60.4, label: "A book that begins in a garden" },
  { id: "book-gospel", kind: "relic", x: 24.6, z: 60.2, label: "A book that begins with a word" },
  { id: "book-quran", kind: "relic", x: 19.4, z: 64.2, label: "A book that begins with a recitation" },
  { id: "book-gita", kind: "relic", x: 24.8, z: 64.0, label: "A book spoken on a field" },
  { id: "book-tao", kind: "relic", x: 22, z: 58.6, label: "A book that will not be named" },
  { id: "book-heart", kind: "relic", x: 17.8, z: 62, label: "A book the size of a palm" },
  { id: "book-elements", kind: "relic", x: 26.2, z: 62, label: "A book of lines and points" },
  { id: "book-red", kind: "relic", x: 22, z: 65.4, label: "A book in a red cover" },
];

export const HOUSE_VERBS = [
  "entering",
  "having",
  "speaking",
  "rooting",
  "making",
  "refining",
  "relating",
  "othering",
  "descending",
  "climbing",
  "gathering",
  "dissolving",
] as const;

for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2 + Math.PI; // 0 aligns toward the threshold (south)
  PROPS.push({
    id: `house-${i}`,
    kind: "relic",
    x: Math.sin(a) * 8.6,
    z: Math.cos(a) * 8.6,
    label: "An unmarked standing stone",
    y: 0.9,
  });
}

function outerWalls(): Wall[] {
  const walls: Wall[] = [];
  walls.push(box(-14, 91, T, 10));
  walls.push(box(14, 91, T, 10));
  walls.push(box(-16, 100, T, 18));
  walls.push(box(16, 100, T, 18));
  return walls;
}

export function buildWalls(): Wall[] {
  const walls: Wall[] = [
    ...outerWalls(),
    ...ring(0, 108, 15.2, [Math.PI * 1.5]),
    ...ring(46, 108, 13.2, [Math.PI * 1.5]),
    ...ring(-46, 108, 14.2, [Math.PI * 1.5]),
    ...hall(0, 99, 0, 94),
    ...manhattan(46, 99, 14, 94),
    ...manhattan(-46, 99, -14, 94),
    ...ring(0, 86, 8.6, [Math.PI * 1.5, Math.PI * 0.5]),
    ...manhattan(0, 78.5, 0, 69),
    ...ring(0, 62, 7.4, [Math.PI * 1.5, Math.PI, Math.PI * 0.5, 0]),
    ...manhattan(0, 55, 0, 47.5),
    box(0, 51.2, 3.7, 0.55, { gate: "persona" }),
    ...manhattan(0, 62, -15, 62),
    ...ring(-22, 62, 6.9, [0, Math.PI]),
    ...manhattan(-22, 62, -32, 62),
    ...ring(-38, 62, 5.7, [0]),
    ...manhattan(7.4, 62, 15.2, 62),
    ...ring(22, 62, 7.1, [Math.PI]),
    ...ring(0, 40, 7.8, [Math.PI * 1.5, 0, Math.PI, Math.PI * 0.5]),
    ...manhattan(0, 40, 16.5, 40),
    ...ring(24, 40, 7.1, [Math.PI, Math.PI * 1.5]),
    ...manhattan(24, 40, 24, 22),
    ...manhattan(24, 22, 22, 22),
    ...manhattan(0, 40, -18, 40),
    ...ring(-26, 40, 8.5, [0]),
    ...manhattan(0, 32.6, 12, 32.6),
    ...manhattan(12, 32.6, 12, 31.6),
    ...ring(12, 26, 5.9, [Math.PI * 1.5, Math.PI * 0.6, Math.PI * 1.1]),
    ...manhattan(12, 20.6, 12, 16),
    ...manhattan(12, 16, 22, 16),
    ...ring(22, 12, 10.6, [Math.PI, Math.PI * 0.15, Math.PI * 1.15]),
    ...manhattan(22, 12, 30, 12, { sync: [5, 6, 7] }),
    ...ring(36, 12, 6.3, [Math.PI]),
    ...manhattan(0, 32.4, 0, 23),
    ...ring(0, 16, 7.1, [Math.PI * 1.5, Math.PI * 0.5, Math.PI]),
    ...manhattan(0, 16, -12.6, 16),
    ...ring(-20, 14, 7.5, [0]),
    ...manhattan(0, 9.2, 0, 10.8),
    box(0, 8.6, 3.7, 0.55, { gate: "center" }),
    ...ring(0, 0, 11.2, [Math.PI * 1.5, Math.PI * 0.5]),
    ...manhattan(0, -11.2, 0, -16),
    box(0, -10.6, 3.7, 0.55, { gate: "workshop" }),
    ...ring(0, -22, 6.9, [Math.PI * 1.5]),
    // Decorative baffles so the precinct feels labyrinthine
    box(-8, 74, 6, T),
    box(8, 70, 7, T),
    box(6, 52, T, 6),
    box(-7, 48, 5, T),
    box(8, 34, T, 8),
    box(-9, 28, 8, T),
    box(4, 22, T, 5),
    box(-8, 20, 6, T),
    box(30, 20, T, 8),
    box(-30, 50, T, 7),
    box(16, 6, 6, T),
    box(-12, 6, T, 6),
  ];
  return walls;
}

export function wallActive(
  wall: Wall,
  flags: Record<string, boolean | number | string>,
  innerHour: number,
): boolean {
  if (flags.timeless) {
    if (wall.gate) return false;
    if (wall.sync) return true;
    return true;
  }
  if (wall.sync && !wall.sync.includes(innerHour)) return false;
  if (wall.gate === "persona") return !flags.personaOff;
  if (wall.gate === "center") return !(flags.shadowNamed && flags.personaOff);
  if (wall.gate === "workshop") return !flags.stoodInCenter || Boolean(flags.inflated);
  return true;
}

export function propVisible(
  prop: Prop,
  flags: Record<string, boolean | number | string>,
  innerHour: number,
  symbols: string[],
): boolean {
  if (prop.symbolId && symbols.includes(prop.symbolId)) return false;
  if (prop.id === "creator" || prop.id === "destroyer" || prop.id === "abraxas" || prop.id === "ledger") {
    return Boolean(flags.stoodInCenter) && !flags.inflated;
  }
  if (prop.id === "workshop-gate") return !flags.stoodInCenter || Boolean(flags.inflated);
  if (prop.id === "inner-gate") return !flags.personaOff;
  if (prop.id === "center-gate") return !(flags.shadowNamed && flags.personaOff);
  if (prop.id === "scarab") {
    if (!(symbols.includes("gold") || flags.lookedWindow)) return false;
  }
  if (prop.sync && !prop.sync.includes(innerHour)) return false;
  if (prop.id === "self") return false;
  return true;
}

export const MASKS: { id: import("./types").MaskId; title: string; line: string }[] = [
  { id: "achiever", title: "The Finished One", line: "I am what I complete." },
  { id: "caretaker", title: "The Holding One", line: "I am what I keep from falling." },
  { id: "seeker", title: "The Asking One", line: "I am the question I cannot put down." },
  { id: "rebel", title: "The Refusing One", line: "I am what I will not join." },
  { id: "bare", title: "No face", line: "I will exist as I show up." },
];
