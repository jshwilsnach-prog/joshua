import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { walkKey, sameRoom } from "../cloudflare/walk-key.js";

describe("walkKey", () => {
  it("empty and missing become the saucer", () => {
    assert.equal(walkKey(""), "saucer");
    assert.equal(walkKey(null), "saucer");
    assert.equal(walkKey(undefined), "saucer");
    assert.equal(walkKey("   "), "saucer");
  });

  it("lowercases and strips", () => {
    assert.equal(walkKey("House"), "house");
    assert.equal(walkKey("  Foo!  "), "foo");
    assert.equal(walkKey("a_b c"), "abc");
  });

  it("keeps hyphen and digits", () => {
    assert.equal(walkKey("saucer-2"), "saucer-2");
  });

  it("caps length", () => {
    assert.equal(walkKey("x".repeat(80)).length, 64);
  });
});

describe("sameRoom", () => {
  it("matches a room to itself", () => {
    assert.equal(sameRoom("house", "HOUSE"), true);
    assert.equal(sameRoom("", ""), true);
  });

  it("drops another thread", () => {
    assert.equal(sameRoom("saucer", "house"), false);
    assert.equal(sameRoom("alpha", "beta"), false);
  });

  it("empty message stays in the saucer, not a named room", () => {
    assert.equal(sameRoom("house", ""), false);
    assert.equal(sameRoom("saucer", ""), true);
  });
});
