import type { Aspect, SaveState } from "./types";
import { PLAYER_START } from "./maze";

export const SAVE_VERSION = 1;
const KEY = "nekyia-save-v1";
const BACKUP = "nekyia-save-v1-prev";

const ASPECTS: Aspect[] = ["persona", "shadow", "anima", "opposites", "self", "creator", "destroyer"];

export function defaultSave(): SaveState {
  const integrations = {} as Record<Aspect, boolean>;
  for (const a of ASPECTS) integrations[a] = false;
  return {
    version: SAVE_VERSION,
    trueName: "",
    mask: null,
    phase: "title",
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    z: PLAYER_START.z,
    yaw: PLAYER_START.yaw,
    pitch: PLAYER_START.pitch,
    visited: [],
    symbols: [],
    flags: {},
    journal: [],
    integrations,
    animaStage: 0,
    kairos: 0.08,
    ending: null,
    echoes: [],
    tasks: { selfless: false, original: false, masterpiece: false, trust: false, love: false },
    originalIdea: "",
    masterpieceTitle: "",
    masterpieceBody: "",
  };
}

function migrate(raw: SaveState): SaveState {
  const base = defaultSave();
  const s = { ...base, ...raw, version: SAVE_VERSION };
  s.flags = { ...base.flags, ...raw.flags };
  s.integrations = { ...base.integrations, ...raw.integrations };
  s.tasks = { ...base.tasks, ...raw.tasks };
  s.journal = raw.journal ?? [];
  s.symbols = raw.symbols ?? [];
  s.visited = raw.visited ?? [];
  s.echoes = raw.echoes ?? [];
  return s;
}

export function loadSave(): SaveState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as SaveState;
    if (!parsed || typeof parsed !== "object") return defaultSave();
    return migrate(parsed);
  } catch {
    return defaultSave();
  }
}

export function writeSave(state: SaveState) {
  try {
    const prev = localStorage.getItem(KEY);
    if (prev) localStorage.setItem(BACKUP, prev);
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
