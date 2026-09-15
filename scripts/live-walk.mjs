/**
 * After deploy: the live relay, not the fakes.
 * A socket hears one room. Many sockets can still knock.
 * Retry only a quiet room or a dropped socket. Never retry a leak.
 */

const FLAKE = /open timeout|socket error|same room did not hear/;

function open(thread) {
  return new Promise((resolve, reject) => {
    const heard = [];
    const ws = new WebSocket(`wss://nekyia.me/api/walk?thread=${encodeURIComponent(thread)}`);
    const t = setTimeout(() => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      reject(new Error(`open timeout ${thread}`));
    }, 8000);
    ws.addEventListener("open", () => {
      clearTimeout(t);
      resolve({
        ws,
        heard,
        send(obj) {
          ws.send(JSON.stringify({ ...obj, thread }));
        },
        close() {
          try {
            ws.close();
          } catch {
            /* ignore */
          }
        },
      });
    });
    ws.addEventListener("message", (ev) => {
      try {
        heard.push(JSON.parse(String(ev.data)));
      } catch {
        /* ignore */
      }
    });
    ws.addEventListener("error", () => {
      clearTimeout(t);
      reject(new Error(`socket error ${thread}`));
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function once() {
  const mark = `gate-${Date.now().toString(36)}`;
  const a = `${mark}-a`;
  const b = `${mark}-b`;
  const token = `idea-${mark}`;
  const sockets = [];
  try {
    const a1 = await open(a);
    const a2 = await open(a);
    const b1 = await open(b);
    sockets.push(a1, a2, b1);
    a1.send({ id: "a1", idea: token, wound: "77" });
    await sleep(1500);
    if (b1.heard.some((m) => m.idea === token)) throw new Error("other room heard");
    const same = a2.heard.find((m) => m.idea === token);
    if (!same) throw new Error("same room did not hear");
    if ("wound" in same) throw new Error("wound still on the wire");
  } finally {
    for (const s of sockets) s.close();
  }
}

let last = null;
for (let i = 0; i < 3; i++) {
  await sleep(i === 0 ? 5000 : 4000);
  try {
    await once();
    console.log("live walk: one socket, one room");
    process.exit(0);
  } catch (err) {
    last = err;
    const msg = String(err?.message ?? err);
    if (!FLAKE.test(msg)) throw err;
    console.error(`flake (${i + 1}/3): ${msg}`);
  }
}
throw last;
