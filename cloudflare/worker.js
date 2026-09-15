/**
 * Nekyia on nekyia.me.
 * Static rooms + /api/aught (KV) + /api/walk (relay).
 * No auth. No people. Nothing on /api/walk is stored or logged.
 * Walk rooms are keyed by thread. Empty thread is the saucer.
 * A socket hears one room. Many sockets can still knock.
 * The relay names the socket. The client does not.
 * Per-socket byte budget lives only in memory. No IPs. No who.
 */

import { walkKey, sameRoom } from "./walk-key.js";

const BURST = 32 * 1024;
const RATE = 16 * 1024;
const MIN_COST = 256;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function messageBytes(message) {
  if (typeof message === "string") return new TextEncoder().encode(message).byteLength;
  if (message instanceof ArrayBuffer) return message.byteLength;
  if (ArrayBuffer.isView(message)) return message.byteLength;
  return 0;
}

function messageCost(message) {
  return Math.max(messageBytes(message), MIN_COST);
}

async function aught(request, env) {
  const kv = env.AUGHT;
  if (!kv) return json({ ok: false }, 200);
  const today = utcDay();
  if (request.method === "POST") {
    try {
      const key = `day:${today}`;
      const n = Number(await kv.get(key)) || 0;
      await kv.put(key, String(n + 1));
      return json({ ok: true });
    } catch {
      return json({ ok: false });
    }
  }
  if (request.method === "GET") {
    try {
      const list = await kv.list({ prefix: "day:" });
      const days = [];
      for (const k of list.keys) {
        const day = String(k.name).slice(4);
        const hits = Number(await kv.get(k.name)) || 0;
        if (day) days.push({ day, hits });
      }
      days.sort((a, b) => a.day.localeCompare(b.day));
      const total = days.reduce((s, d) => s + d.hits, 0);
      return json({ today, total, days });
    } catch {
      return json({ today, total: 0, days: [] });
    }
  }
  return new Response("no", { status: 405 });
}

export class WalkRoom {
  constructor(state) {
    this.ctx = state;
    this.budgets = new WeakMap();
  }
  takeBudget(ws, message, now = Date.now()) {
    const cost = messageCost(message);
    let b = this.budgets.get(ws);
    if (!b) {
      b = { tokens: BURST, last: now };
      this.budgets.set(ws, b);
    }
    const elapsed = Math.max(0, (now - b.last) / 1000);
    b.tokens = Math.min(BURST, b.tokens + elapsed * RATE);
    b.last = now;
    if (b.tokens < cost) return false;
    b.tokens -= cost;
    return true;
  }
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("walk", { status: 426 });
    }
    const key = walkKey(new URL(request.url).searchParams.get("thread"));
    const pair = new WebSocketPair();
    const sid = crypto.randomUUID();
    pair[1].serializeAttachment({ key, sid });
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  webSocketMessage(ws, message) {
    if (!this.takeBudget(ws, message)) return;
    const att = ws.deserializeAttachment() || {};
    const room = walkKey(att.key);
    let data;
    try {
      data = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message));
    } catch {
      return;
    }
    if (!data || typeof data !== "object") return;
    if (!sameRoom(room, data.thread)) return;
    if (data.type === "ping") {
      try {
        ws.send(JSON.stringify({ type: "pong" }));
      } catch {
        /* ignore */
      }
      return;
    }
    let sid = att.sid;
    if (!sid) {
      sid = crypto.randomUUID();
      try {
        ws.serializeAttachment({ ...att, sid });
      } catch {
        /* ignore */
      }
    }
    data.id = sid;
    delete data.wound;
    const body = JSON.stringify(data);
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== ws) {
        try {
          peer.send(body);
        } catch {
          /* ignore */
        }
      }
    }
  }
  webSocketClose(ws) {
    const att = ws.deserializeAttachment() || {};
    const sid = att.sid;
    if (!sid) return;
    const room = walkKey(att.key);
    const body = JSON.stringify({ type: "leave", id: sid, thread: room });
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== ws) {
        try {
          peer.send(body);
        } catch {
          /* ignore */
        }
      }
    }
  }
  webSocketError(ws) {
    this.webSocketClose(ws);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/aught") return aught(request, env);
    if (url.pathname === "/api/walk") {
      const id = env.WALK.idFromName(walkKey(url.searchParams.get("thread")));
      return env.WALK.get(id).fetch(request);
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Nekyia", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
