import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isNear, canTake } from "./walk-guard.ts";

describe("walk-guard", () => {
  it("a pose at 9999 is not near", () => {
    assert.equal(isNear(0, 108, 9999, 9999), false);
  });
  it("a body within 3.2 is near", () => {
    assert.equal(isNear(0, 108, 1, 108), true);
  });
  it("the pause sits on the victim", () => {
    assert.equal(canTake(0, 7999), false);
    assert.equal(canTake(0, 8000), true);
  });
});

  it("GameRoot imports the guard", () => {
    const src = readFileSync(new URL("./GameRoot.tsx", import.meta.url), "utf8");
    const m = src.match(/^[ \t]*import \{([^}]+)\} from ["']\.\/walk-guard["'];?[ \t]*$/m);
    assert.ok(m, "GameRoot must import ./walk-guard on its own line, not commented");
    const names = m[1].split(",").map((s) => s.trim());
    assert.equal(names.includes("isNear"), true);
    assert.equal(names.includes("canTake"), true);
    assert.equal(names.includes("TAKE_MS"), true);
  });
