/**
 * After deploy: the live relay, not the fakes.
 * A socket hears one room. Many sockets can still knock.
 */

const mark = `gate-${Date.now().toString(36)}`;
const a = `${mark}-a`;
const b = `${mark}-b`;
const token = `idea-${mark}`;

function open(thread) {
  return new Promise((resolve, reject) => {
    const heard = [];
    const ws = new WebSocket(`wss://nekyia.me/api/walk?thread=${encodeURIComponent(thread)}`);
    const t = setTimeout(() => reject(new Error(`open timeout ${thread}`)), 8000);
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

const a1 = await open(a);
const a2 = await open(a);
const b1 = await open(b);

a1.send({ id: "a1", idea: token, wound: "77" });
await sleep(1200);

const same = a2.heard.find((m) => m.idea === token);
if (!same) {
  a1.close();
  a2.close();
  b1.close();
  throw new Error("same room did not hear");
}
if ("wound" in same) {
  a1.close();
  a2.close();
  b1.close();
  throw new Error("wound still on the wire");
}
if (b1.heard.some((m) => m.idea === token)) {
  a1.close();
  a2.close();
  b1.close();
  throw new Error("other room heard");
}

a1.close();
a2.close();
b1.close();
console.log("live walk: one socket, one room");
