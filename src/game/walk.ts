/**
 * Two living walkers, one lamp.
 * /api/walk is a relay: nothing stored, nothing logged.
 * Rooms are keyed by thread. Empty thread is the saucer.
 * If the socket is not there, same-origin BroadcastChannel is the fallback.
 * Presence is not a who. No address, no seed, no name.
 */

export type WalkMsg = Record<string, unknown>;

export function walkThread(raw: unknown) {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 64)
    .replace(/[^a-z0-9-]/g, "");
  return t || "saucer";
}

type WalkHandlers = {
  id: string;
  thread: () => string;
  pose: () => WalkMsg;
  onMessage: (data: WalkMsg) => void;
};

let outbound: ((msg: WalkMsg) => void) | null = null;

export function walkSend(msg: WalkMsg) {
  outbound?.(msg);
}

export function startWalk(h: WalkHandlers) {
  let ws: WebSocket | null = null;
  let bc: BroadcastChannel | null = null;
  let usingBc = false;
  let dead = false;
  let room = walkThread(h.thread());

  const deliver = (data: WalkMsg) => {
    if (dead) return;
    if (data.id === h.id) return;
    h.onMessage(data);
  };

  const closeBc = () => {
    usingBc = false;
    try {
      bc?.close();
    } catch {
      /* ignore */
    }
    bc = null;
  };

  const openBc = () => {
    if (dead) return;
    closeBc();
    usingBc = true;
    try {
      bc = new BroadcastChannel(`nekyia-walk:${room}`);
      bc.onmessage = (ev) => deliver((ev.data ?? {}) as WalkMsg);
    } catch {
      /* ignore */
    }
  };

  const closeWs = () => {
    try {
      ws?.close();
    } catch {
      /* ignore */
    }
    ws = null;
  };

  const openWs = () => {
    if (dead) return;
    closeWs();
    try {
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${proto}//${location.host}/api/walk?thread=${encodeURIComponent(room)}`);
      ws.onmessage = (ev) => {
        try {
          deliver(JSON.parse(String(ev.data)) as WalkMsg);
        } catch {
          /* ignore */
        }
      };
      ws.onerror = () => openBc();
      ws.onclose = () => {
        if (!dead) openBc();
      };
    } catch {
      openBc();
    }
  };

  const send = (msg: WalkMsg) => {
    if (dead) return;
    const body = { ...msg, id: h.id, thread: room };
    delete body.wound;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(body));
      } catch {
        /* ignore */
      }
      return;
    }
    if (!usingBc) openBc();
    try {
      bc?.postMessage(body);
    } catch {
      /* ignore */
    }
  };
  outbound = send;

  openWs();

  const tick = window.setInterval(() => {
    if (dead) return;
    const next = walkThread(h.thread());
    if (next !== room) {
      room = next;
      closeBc();
      openWs();
    }
    send(h.pose());
  }, 240);

  return {
    send,
    stop() {
      dead = true;
      if (outbound === send) outbound = null;
      window.clearInterval(tick);
      closeWs();
      closeBc();
    },
  };
}
