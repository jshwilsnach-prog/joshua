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
});
