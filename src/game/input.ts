export type InputState = {
  keys: Set<string>;
  lookDx: number;
  lookDy: number;
  moveX: number;
  moveY: number;
  locked: boolean;
  interactPressed: boolean;
  journalPressed: boolean;
  pausePressed: boolean;
};

export const input: InputState = {
  keys: new Set(),
  lookDx: 0,
  lookDy: 0,
  moveX: 0,
  moveY: 0,
  locked: false,
  interactPressed: false,
  journalPressed: false,
  pausePressed: false,
};

const GAME_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Space", "KeyE", "KeyJ", "Escape", "ShiftLeft", "ShiftRight"]);

export function bindInput(target: HTMLElement) {
  const onDown = (e: KeyboardEvent) => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    input.keys.add(e.code);
    if (e.code === "KeyE" || e.code === "Space") input.interactPressed = true;
    if (e.code === "KeyJ") input.journalPressed = true;
    if (e.code === "Escape") input.pausePressed = true;
  };
  const onUp = (e: KeyboardEvent) => {
    input.keys.delete(e.code);
  };
  const clear = () => input.keys.clear();
  const onMouse = (e: MouseEvent) => {
    if (!input.locked) return;
    input.lookDx += e.movementX;
    input.lookDy += e.movementY;
  };
  const onLock = () => {
    input.locked = document.pointerLockElement === target;
  };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  document.addEventListener("mousemove", onMouse);
  document.addEventListener("pointerlockchange", onLock);
  return () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", clear);
    document.removeEventListener("mousemove", onMouse);
    document.removeEventListener("pointerlockchange", onLock);
  };
}

export function consumeLook() {
  const x = input.lookDx;
  const y = input.lookDy;
  input.lookDx = 0;
  input.lookDy = 0;
  return [x, y] as const;
}

export function consumeEdges() {
  const e = { interact: input.interactPressed, journal: input.journalPressed, pause: input.pausePressed };
  input.interactPressed = false;
  input.journalPressed = false;
  input.pausePressed = false;
  return e;
}

export function setKeys(codes: string[]) {
  input.keys = new Set(codes);
}

export function radialDeadzone(x: number, y: number, dz = 0.15) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}
