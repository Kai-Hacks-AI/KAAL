// Code tests for structure.mjs beyond graph/C2's planned tests: the immutability
// graph/N3 promises, checked where a frozen Map would not hold it.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cycles, reverse } from "@kaihacksai/kaal-graph";

describe("graph/N3: results cannot be changed", () => {
  it("reverse offers no way to write, and every attempt fails without changing it", () => {
    const r = reverse(new Map([["a", ["b"]], ["c", ["b"]]]));
    const before = JSON.stringify([...r]);
    for (const write of ["set", "delete", "clear"]) assert.equal(r[write], undefined, `reverse offers no ${write}`);
    assert.throws(() => Map.prototype.set.call(r, "x", []), TypeError);
    assert.throws(() => Map.prototype.delete.call(r, "b"), TypeError);
    assert.throws(() => Map.prototype.clear.call(r), TypeError);
    assert.throws(() => { r.set = () => {}; }, TypeError);
    assert.throws(() => { Object.getPrototypeOf(r).get = () => []; }, TypeError);
    assert.throws(() => r.get("b").push("z"), TypeError);
    assert.equal(JSON.stringify([...r]), before);
    assert.deepEqual(r.get("b"), ["a", "c"]);
  });

  it("reverse reads like a Map: size, get, has, keys, values, entries, forEach and iteration agree", () => {
    const r = reverse({ a: ["b"], b: [] });
    assert.equal(r.size, 2);
    assert.equal(r.has("a"), true);
    assert.equal(r.has("z"), false);
    assert.equal(r.get("z"), undefined);
    assert.deepEqual([...r.keys()], ["a", "b"]);
    assert.deepEqual([...r.values()], [[], ["a"]]);
    assert.deepEqual([...r.entries()], [...r]);
    const seen = [];
    r.forEach((list, id, map) => seen.push([id, list, map === r]));
    assert.deepEqual(seen, [["a", [], true], ["b", ["a"], true]]);
  });

  it("cycles cannot be changed, at either level", () => {
    const found = cycles({ a: ["b"], b: ["a"] });
    assert.throws(() => found.push(["x"]), TypeError);
    assert.throws(() => found[0].push("x"), TypeError);
  });
});
