// graph/C8 planned test: reach, reverse and cycles compose (plan/composition/testing.md).
// Immutable to DO and CHECK; graph/C9 turns it GREEN. It uses kaal-graph's public interface only.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cycles, reach, reverse } from "@kaihacksai/kaal-graph";

/** A caller's own read-only Map: Map's reading interface over a private Map, and nothing that writes. */
class Readonly {
  #map;
  constructor(entries) {
    this.#map = new Map(entries);
  }
  get size() {
    return this.#map.size;
  }
  get(id) {
    return this.#map.get(id);
  }
  has(id) {
    return this.#map.has(id);
  }
  keys() {
    return this.#map.keys();
  }
  values() {
    return this.#map.values();
  }
  entries() {
    return this.#map.entries();
  }
  forEach(callback, thisArg) {
    for (const [id, list] of this.#map) callback.call(thisArg, list, id, this);
  }
  [Symbol.iterator]() {
    return this.#map.entries();
  }
}

const plain = { a: ["b"], b: ["c"], c: ["b"], d: [] };
const pairs = (relation) => [...relation].map(([id, list]) => [id, [...list]]);

describe("graph/C8: composition", () => {
  it("graph/T16 [graph/F4, graph/I7, graph/F1, graph/F2, graph/F3]: the relation reverse returns, and a caller's own read-only Map, compose with reach, cycles and reverse with every edge kept; a plain object still works", () => {
    const back = reverse(plain);
    assert.deepEqual([...reach(back, "c")], ["c", "b", "a"]);
    assert.deepEqual(cycles(back), cycles(plain));
    assert.deepEqual(cycles(back), [["b", "c"]]);
    assert.deepEqual(pairs(reverse(back)), [["a", ["b"]], ["b", ["c"]], ["c", ["b"]], ["d", []]]);
    const own = new Readonly(Object.entries(plain));
    assert.deepEqual([...reach(own, "a")], ["a", "b", "c"]);
    assert.deepEqual(cycles(own), [["b", "c"]]);
    assert.deepEqual(pairs(reverse(own)), pairs(back));
    assert.deepEqual([...reach(plain, "a")], ["a", "b", "c"]);
    assert.deepEqual(pairs(reverse(new Map(Object.entries(plain)))), pairs(back));
  });
});
