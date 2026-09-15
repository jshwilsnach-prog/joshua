/** Thread → one relay room. Empty is the saucer. Not a who. */

export function walkKey(raw) {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 64)
    .replace(/[^a-z0-9-]/g, "");
  return t || "saucer";
}

export function sameRoom(socketKey, msgThread) {
  return walkKey(socketKey) === walkKey(msgThread);
}
