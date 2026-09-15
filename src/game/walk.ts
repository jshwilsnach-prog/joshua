/**
 * Two living walkers, one lamp.
 * /api/walk is a relay: nothing stored, nothing logged.
 * If the socket is not there, same-origin BroadcastChannel is the fallback.
 * Presence is not a who. No address, no seed, no name.
 */

export type WalkMsg = Record<string, unknown>;

type WalkHandlers = {
  id: string;
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

  const deliver = (data: WalkMsg) => {
    if (dead) return;
    if (data.id === h.id) return;
    h.onMessage(data);
  };

  const openBc = () => {
    if (usingBc || dead) return;
    usingBc = true;
    try {
      bc = new BroadcastChannel("nekyia-walk");
      bc.onmessage = (ev) => deliver((ev.data ?? {}) as WalkMsg);
    } catch {
      /* ignore */
    }
  };

  const send = (msg: WalkMsg) => {
    if (dead) return;
    const body = { ...msg, id: h.id };
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

  try {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${proto}//${location.host}/api/walk`);
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

  const tick = window.setInterval(() => {
    if (dead) return;
    send(h.pose());
  }, 240);

  return {
    send,
    stop() {
      dead = true;
      if (outbound === send) outbound = null;
      window.clearInterval(tick);
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
      try {
        bc?.close();
      } catch {
        /* ignore */
      }
    },
  };
}
