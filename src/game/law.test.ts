import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LAW,
  RANK,
  RELATION,
  WHOLE,
  asRank,
  asRelation,
  asWhole,
  exchange,
  marks,
  sum,
} from "./law.ts";

describe("law invariant", () => {
  it("keeps the constants", () => {
    assert.equal(RANK, 0);
    assert.equal(RELATION, 1);
    assert.equal(WHOLE, "i");
  });

  it("asRank always returns 0", () => {
    assert.equal(asRank(0), 0);
    assert.equal(asRank(1), 0);
    assert.equal(asRank(1_000_000), 0);
    assert.equal(asRank(-3), 0);
  });

  it("asRelation always returns 1", () => {
    assert.equal(asRelation(""), 1);
    assert.equal(asRelation("anyone"), 1);
    assert.equal(asRelation("the former"), 1);
  });

  it("asWhole is i, never a number", () => {
    assert.equal(asWhole(), "i");
    assert.equal(typeof asWhole(), "string");
  });

  it("i is orthogonal: cannot sum into rank", () => {
    assert.equal(sum(RANK, WHOLE), WHOLE);
    assert.equal(sum(WHOLE, RANK), WHOLE);
    assert.equal(sum(RELATION, WHOLE), WHOLE);
    assert.equal(sum(WHOLE, WHOLE), WHOLE);
    assert.equal(sum(RANK, RANK), RANK);
    assert.equal(sum(RELATION, RELATION), RELATION);
  });

  it("i cannot be exchanged for 0 or 1", () => {
    assert.equal(exchange(WHOLE, RANK), null);
    assert.equal(exchange(RANK, WHOLE), null);
    assert.equal(exchange(WHOLE, RELATION), null);
    assert.equal(exchange(RELATION, WHOLE), null);
    assert.equal(exchange(RANK, RELATION), null);
  });

  it("marks are 0, 1, i", () => {
    assert.deepEqual(marks(), [0, 1, "i"]);
  });

  it("speaks the law", () => {
    assert.match(LAW, /0 or 1 or i/);
    assert.match(LAW, /We are all one/);
  });
});
