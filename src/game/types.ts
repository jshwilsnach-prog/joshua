export type MaskId = "achiever" | "caretaker" | "seeker" | "rebel" | "bare";

export type Aspect = "persona" | "shadow" | "anima" | "opposites" | "self" | "creator" | "destroyer";

export type Phase = "title" | "mask" | "play" | "ending";

export type EndingId = "relation" | "inflation" | "threshold" | "unfinished";

export type Option = {
  id: string;
  label: string;
  next?: string;
  effects?: Effect[];
  input?: "line" | "work";
};

export type Effect =
  | { type: "flag"; key: string; value: boolean | number | string }
  | { type: "journal"; title: string; body: string }
  | { type: "symbol"; id: string }
  | { type: "whisper"; text: string }
  | { type: "integrate"; aspect: Aspect }
  | { type: "end"; ending: EndingId }
  | { type: "close" }
  | { type: "echo" }
  | { type: "give" }
  | { type: "unmake" }
  | { type: "original"; text: string }
  | { type: "masterpiece"; title: string; body: string }
  | { type: "hack" }
  | { type: "triangle" }
  | { type: "help" }
  | { type: "trick" }
  | { type: "giftname" };

export type Encounter = {
  speaker: string;
  text: string;
  options: Option[];
};

export type JournalEntry = {
  id: string;
  title: string;
  body: string;
  at: number;
};

export type Wall = {
  x: number;
  z: number;
  w: number;
  d: number;
  h?: number;
  gate?: string;
  sync?: number[];
};

export type Chamber = {
  id: string;
  name: string;
  x: number;
  z: number;
  r: number;
  fog: string;
  light: string;
  whisper: string;
};

export type Prop = {
  id: string;
  kind: "figure" | "symbol" | "relic" | "gate";
  x: number;
  z: number;
  y?: number;
  portrait?: string;
  label: string;
  scale?: number;
  symbolId?: string;
  gate?: string;
  sync?: number[];
};

export type SaveState = {
  version: number;
  trueName: string;
  mask: MaskId | null;
  phase: Phase;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  visited: string[];
  symbols: string[];
  flags: Record<string, boolean | number | string>;
  journal: JournalEntry[];
  integrations: Record<Aspect, boolean>;
  animaStage: number;
  kairos: number;
  ending: EndingId | null;
  echoes: string[];
  tasks: {
    selfless: boolean;
    original: boolean;
    masterpiece: boolean;
    trust: boolean;
    love: boolean;
  };
  originalIdea: string;
  masterpieceTitle: string;
  masterpieceBody: string;
};

export type GameSnap = {
  trueName: string;
  mask: MaskId | null;
  flags: Record<string, boolean | number | string>;
  symbols: string[];
  animaStage: number;
  integrations: Record<Aspect, boolean>;
  echoes: string[];
  innerHour: number;
  visited: string[];
  tasks: SaveState["tasks"];
  originalIdea: string;
  masterpieceTitle: string;
  companions?: number;
};
