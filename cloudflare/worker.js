/**
 * Nekyia on nekyia.me.
 * Static rooms + /api/aught (KV) + /api/walk (relay).
 * No auth. No people. Nothing on /api/walk is stored or logged.
 */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function utcDay() {
  return new Date().toISOString().slice(0, 10);
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
  }
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("walk", { status: 426 });
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  webSocketMessage(ws, message) {
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== ws) {
        try {
          peer.send(message);
        } catch {
          /* ignore */
        }
      }
    }
  }
  webSocketClose() {}
  webSocketError() {}
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/aught") return aught(request, env);
    if (url.pathname === "/api/walk") {
      const id = env.WALK.idFromName("house");
      return env.WALK.get(id).fetch(request);
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Nekyia", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
