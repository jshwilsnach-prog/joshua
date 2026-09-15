/**
 * Dev doors so the workshop preview matches the house:
 * /api/aught in memory (UTC day + number). No Postgres. No people.
 * /api/walk is production-only (Cloudflare Durable Object).
 * Preview falls back to BroadcastChannel in the client.
 */
function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

export function houseDoorsPlugin() {
  const days = new Map();
  return {
    name: "nekyia-house-doors",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?", 1)[0];
        if (path !== "/api/aught") {
          next();
          return;
        }
        const today = utcDay();
        if ((req.method ?? "GET").toUpperCase() === "POST") {
          days.set(today, (days.get(today) ?? 0) + 1);
          const body = Buffer.from(JSON.stringify({ ok: true }), "utf8");
          res.statusCode = 200;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.setHeader("cache-control", "no-store");
          res.end(body);
          return;
        }
        if ((req.method ?? "GET").toUpperCase() === "GET") {
          const list = [...days.entries()]
            .map(([day, hits]) => ({ day, hits }))
            .sort((a, b) => a.day.localeCompare(b.day));
          const total = list.reduce((s, d) => s + d.hits, 0);
          const body = Buffer.from(JSON.stringify({ today, total, days: list }), "utf8");
          res.statusCode = 200;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.setHeader("cache-control", "no-store");
          res.end(body);
          return;
        }
        res.statusCode = 405;
        res.end("no");
      });
    },
  };
}
