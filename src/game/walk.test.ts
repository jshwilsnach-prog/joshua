import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { walkThread } from "./walk.ts";

describe("walkThread", () => {
  it("empty is the saucer", () => {
    assert.equal(walkThread(""), "saucer");
    assert.equal(walkThread("  "), "saucer");
  });

  it("does not let one word hear another", () => {
    assert.notEqual(walkThread("alpha"), walkThread("beta"));
    assert.notEqual(walkThread(""), walkThread("house"));
  });
});
