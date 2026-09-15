/** A socket hears one room. Many sockets can still knock. */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker, { WalkRoom } from "../cloudflare/worker.js";

class FakeWs {
  constructor() {
    this.sent = [];
    this.att = null;
  }
  serializeAttachment(a) {
    this.att = a;
  }
  deserializeAttachment() {
    return this.att;
  }
  send(m) {
    this.sent.push(m);
  }
}

function envSpy() {
  const names = [];
  return {
    names,
    env: {
      WALK: {
        idFromName(name) {
          names.push(name);
          return { name };
        },
        get(id) {
          return {
            fetch() {
              return new Response("walk", { status: 426 });
            },
            id,
          };
        },
      },
    },
  };
}

function roomPair() {
  const a = new FakeWs();
  const b = new FakeWs();
  a.serializeAttachment({ key: "alpha", sid: "relay-a" });
  b.serializeAttachment({ key: "alpha", sid: "relay-b" });
  const room = new WalkRoom({
    acceptWebSocket() {},
    getWebSockets() {
      return [a, b];
    },
  });
  return { a, b, room };
}

describe("walk worker rooms", () => {
  it("opens two threads as two rooms, not one house", async () => {
    const { names, env } = envSpy();
    await worker.fetch(new Request("https://nekyia.me/api/walk?thread=alpha"), env);
    await worker.fetch(new Request("https://nekyia.me/api/walk?thread=beta"), env);
    await worker.fetch(new Request("https://nekyia.me/api/walk"), env);
    assert.deepEqual(names, ["alpha", "beta", "saucer"]);
    assert.equal(names.includes("house"), false);
  });

  it("a socket in one room does not hear another", () => {
    const a = new FakeWs();
    const b = new FakeWs();
    a.serializeAttachment({ key: "alpha" });
    b.serializeAttachment({ key: "alpha" });
    const room = new WalkRoom({
      acceptWebSocket() {},
      getWebSockets() {
        return [a, b];
      },
    });
    room.webSocketMessage(a, JSON.stringify({ thread: "alpha", idea: "here", wound: "77" }));
    assert.equal(b.sent.length, 1);
    const ok = JSON.parse(b.sent[0]);
    assert.equal(ok.idea, "here");
    assert.equal("wound" in ok, false);

    room.webSocketMessage(a, JSON.stringify({ thread: "beta", idea: "no" }));
    assert.equal(b.sent.length, 1);
  });
  it("the relay names the socket, not the client", () => {
    const a = new FakeWs();
    const b = new FakeWs();
    a.serializeAttachment({ key: "alpha", sid: "relay-a" });
    b.serializeAttachment({ key: "alpha", sid: "relay-b" });
    const room = new WalkRoom({
      acceptWebSocket() {},
      getWebSockets() {
        return [a, b];
      },
    });
    room.webSocketMessage(a, JSON.stringify({ thread: "alpha", id: "forged", idea: "here" }));
    assert.equal(b.sent.length, 1);
    const ok = JSON.parse(b.sent[0]);
    assert.equal(ok.id, "relay-a");
    assert.equal(ok.idea, "here");
  });

  it("the relay says when a socket leaves", () => {
    const a = new FakeWs();
    const b = new FakeWs();
    a.serializeAttachment({ key: "alpha", sid: "relay-a" });
    b.serializeAttachment({ key: "alpha", sid: "relay-b" });
    const room = new WalkRoom({
      acceptWebSocket() {},
      getWebSockets() {
        return [b];
      },
    });
    room.webSocketClose(a);
    assert.equal(b.sent.length, 1);
    const ok = JSON.parse(b.sent[0]);
    assert.equal(ok.type, "leave");
    assert.equal(ok.id, "relay-a");
  });

  it("drops a flood and does not close the socket", () => {
    const { a, b, room } = roomPair();
    const idea = "x".repeat(2000);
    const n = 80;
    for (let i = 0; i < n; i++) {
      room.webSocketMessage(a, JSON.stringify({ thread: "alpha", idea }));
    }
    assert.ok(b.sent.length < n, `flood all ${b.sent.length} of ${n} got through`);
    assert.ok(b.sent.length > 0);
    assert.equal(a.att.sid, "relay-a");
    room.webSocketMessage(a, JSON.stringify({ thread: "alpha", idea: "after" }));
    assert.equal(a.att.sid, "relay-a");
  });

  it("an honest pose every 240 ms with a 500-char idea still gets through", async () => {
    const { a, b, room } = roomPair();
    const idea = "y".repeat(500);
    const n = 6;
    for (let i = 0; i < n; i++) {
      if (i) await new Promise((r) => setTimeout(r, 240));
      room.webSocketMessage(a, JSON.stringify({ thread: "alpha", idea }));
    }
    assert.equal(b.sent.length, n);
    assert.equal(JSON.parse(b.sent.at(-1)).idea, idea);
  });
});
