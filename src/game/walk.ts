/**
 * Two living walkers, one lamp.
 * /api/walk is a relay: nothing stored, nothing logged.
 * Rooms are keyed by thread. Empty thread is the saucer.
 * A socket hears one room. Many sockets can still knock.
 * If the socket drops, BroadcastChannel holds the same browser until it reconnects.
 * Presence is not a who. No address, no seed, no name.
 */

import { walkKey } from "../../cloudflare/walk-key.js";

export type WalkMsg = Record<string, unknown>;

export function walkThread(raw: unknown) {
  return walkKey(raw);
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
  let retries = 0;
  let wake: number | null = null;
  let lastPong = Date.now();

  const deliver = (data: WalkMsg) => {
    if (dead) return;
    if (data.type === "pong") {
      lastPong = Date.now();
      return;
    }
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
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      ws.onopen = null;
      ws.onmessage = null;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    }
    ws = null;
  };

  const later = () => {
    if (dead) return;
    const delay = Math.min(1000 * 2 ** retries, 8000);
    retries += 1;
    if (wake != null) window.clearTimeout(wake);
    wake = window.setTimeout(() => {
      wake = null;
      openWs();
    }, delay);
  };

  const openWs = () => {
    if (dead) return;
    closeWs();
    try {
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${proto}//${location.host}/api/walk?thread=${encodeURIComponent(room)}`);
      ws.onopen = () => {
        retries = 0;
        closeBc();
      };
      ws.onmessage = (ev) => {
        try {
          deliver(JSON.parse(String(ev.data)) as WalkMsg);
        } catch {
          /* ignore */
        }
      };
      ws.onerror = () => openBc();
      ws.onclose = () => {
        if (dead) return;
        openBc();
        later();
      };
    } catch {
      openBc();
      later();
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
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (Date.now() - lastPong > 8000) {
        closeWs();
        openBc();
        later();
      } else {
        send({ type: "ping" });
      }
    }
    send(h.pose());
  }, 240);

  const onWake = () => {
    if (dead) return;
    retries = 0;
    openWs();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") onWake();
  };
  window.addEventListener("online", onWake);
  document.addEventListener("visibilitychange", onVisible);

  return {
    send,
    stop() {
      dead = true;
      if (outbound === send) outbound = null;
      window.clearInterval(tick);
      if (wake != null) window.clearTimeout(wake);
      window.removeEventListener("online", onWake);
      document.removeEventListener("visibilitychange", onVisible);
      closeWs();
      closeBc();
    },
  };
}
