// graph/C12 planned test: witness paths (plan/witness/testing.md).
// Immutable to DO and CHECK; graph/C13 turns it GREEN. It uses kaal-graph's public interface only.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { path, reverse } from "kaal-graph";

describe("witness paths", () => {
  it("graph/T17 [graph/F13, graph/N9]: path returns the shortest, deterministic route and reads read-only relations", () => {
    const s = { a: ["c", "b"], b: ["d"], c: ["d"], d: ["e"], e: ["b"], f: [] };
    // Equal-length routes a-b-d and a-c-d: breadth-first along sorted successors discovers b first.
    assert.deepEqual(path(s, "a", "d"), ["a", "b", "d"]);
    assert.deepEqual(path(s, "a", "e"), ["a", "b", "d", "e"]);
    // Shortest, not first found by depth: a-c-d is not preferred over the direct a-b.
    assert.deepEqual(path(s, "a", "b"), ["a", "b"]);
    // The identity itself, on a cycle or off the structure.
    assert.deepEqual(path(s, "b", "b"), ["b"]);
    assert.deepEqual(path(s, "zzz", "zzz"), ["zzz"]);
    // Unreachable, and unknown identities.
    assert.equal(path(s, "f", "a"), undefined);
    assert.equal(path(s, "a", "f"), undefined);
    assert.equal(path(s, "x", "y"), undefined);
    // A cycle terminates and the route is a simple one.
    assert.deepEqual(path(s, "e", "d"), ["e", "b", "d"]);
    // Frozen result, input unchanged.
    const before = JSON.stringify(s);
    const route = path(s, "a", "e");
    assert.ok(Object.isFrozen(route));
    assert.equal(JSON.stringify(s), before);
    // Any order of keys and successors gives the same answer.
    const shuffled = { f: [], e: ["b"], d: ["e"], c: ["d"], b: ["d"], a: ["b", "c"] };
    assert.deepEqual(path(shuffled, "a", "e"), [...route]);
    // A Map, and the read-only relation reverse returns, read against the edges.
    assert.deepEqual(path(new Map(Object.entries(s)), "a", "d"), ["a", "b", "d"]);
    assert.deepEqual(path(reverse(s), "d", "a"), ["d", "b", "a"]);
  });
});
