import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { walkKey, roomAllows } from "../cloudflare/walk-key.js";

describe("walkKey", () => {
  it("sends empty to the saucer", () => {
    assert.equal(walkKey(""), "saucer");
    assert.equal(walkKey(null), "saucer");
    assert.equal(walkKey("   "), "saucer");
  });

  it("cleans a thread name", () => {
    assert.equal(walkKey("Secret-Thread"), "secret-thread");
    assert.equal(walkKey("House One"), "houseone");
    assert.equal(walkKey("a/../b"), "ab");
  });

  it("caps length", () => {
    assert.equal(walkKey("x".repeat(80)).length, 64);
  });
});

describe("roomAllows", () => {
  it("keeps a socket in one room", () => {
    assert.equal(roomAllows("saucer", ""), true);
    assert.equal(roomAllows("saucer", "saucer"), true);
    assert.equal(roomAllows("foo", "FOO"), true);
    assert.equal(roomAllows("saucer", "other"), false);
    assert.equal(roomAllows("lintel", ""), false);
  });
});
