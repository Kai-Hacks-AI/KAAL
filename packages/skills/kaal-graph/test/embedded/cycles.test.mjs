// graph/C2 planned tests: Structural Reach and Cycles.
// Immutable to DO and CHECK; graph/C3 turns them GREEN. Each title names the
// contracts it checks (plan/cycles/*.md). They use kaal-graph's public interface only.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as graph from "kaal-graph";

/** An export of kaal-graph, or the reason the tests are blocked before any behavioural assertion. */
function exported(name) {
  assert.equal(typeof graph[name], "function", `blocked before behavioural assertion: kaal-graph exports no ${name}`);
  return graph[name];
}

const map = (o) => new Map(Object.entries(o));
const shuffled = (o) => map(Object.fromEntries(Object.entries(o).reverse().map(([k, v]) => [k, [...v].reverse()])));

describe("graph/C2: structural reach and cycles", () => {
  it("graph/T1 [graph/F1, graph/F4]: an acyclic structure has no cycles; a self-edge is a cycle of one", () => {
    const cycles = exported("cycles");
    assert.deepEqual(cycles(map({ a: ["b", "c"], b: ["c"], c: [] })), []);
    assert.deepEqual(cycles(map({ a: ["b"], b: [] })), []);
    assert.deepEqual(cycles(map({ x: ["x"], y: ["x"] })), [["x"]]);
  });

  it("graph/T2 [graph/F1, graph/I1]: A1 → D1 → T2 → A1 is reported sorted; disjoint cycles apart and in order; cycles sharing a member are one component", () => {
    const cycles = exported("cycles");
    assert.deepEqual(cycles(map({ "s/A1": ["s/D1"], "s/D1": ["s/T2"], "s/T2": ["s/A1", "s/F1"], "s/F1": ["s/I1"], "s/I1": ["s/C1"], "s/C1": [] })), [["s/A1", "s/D1", "s/T2"]]);
    assert.deepEqual(cycles(map({ q: ["p"], p: ["q"], b: ["a"], a: ["b"] })), [["a", "b"], ["p", "q"]]);
    assert.deepEqual(cycles(map({ a: ["b"], b: ["a", "c"], c: ["b"] })), [["a", "b", "c"]]);
  });

  it("graph/T3 [graph/F2, graph/F4]: reach yields each identity once, terminates on a cycle, includes start, and reaches a successor that is not a key", () => {
    const reach = exported("reach");
    assert.deepEqual([...reach(map({ a: ["c", "b"], b: ["a"], c: ["z"] }), "a")], ["a", "b", "c", "z"]);
    assert.deepEqual([...reach(map({ a: ["a"] }), "a")], ["a"]);
    assert.deepEqual([...reach(map({}), "lonely")], ["lonely"]);
  });

  it("graph/T4 [graph/F3, graph/F4]: reverse derives sorted predecessors, including for a successor that is not a key", () => {
    const reverse = exported("reverse");
    const r = reverse(map({ c: ["z"], a: ["z", "b"], b: [] }));
    assert.deepEqual(Object.fromEntries(r), { a: [], b: ["a"], c: [], z: ["a", "c"] });
  });

  it("graph/T5 [graph/N1]: the same structure in any key and successor order gives the same cycles, reach and reverse", () => {
    const [cycles, reach, reverse] = ["cycles", "reach", "reverse"].map(exported);
    const s = { a: ["b", "d"], b: ["c"], c: ["a", "e"], d: ["d"], e: ["f"], f: ["e"] };
    assert.deepEqual(cycles(shuffled(s)), cycles(map(s)));
    assert.deepEqual([...reach(shuffled(s), "a")], [...reach(map(s), "a")]);
    assert.deepEqual(Object.fromEntries(reverse(shuffled(s))), Object.fromEntries(reverse(map(s))));
  });

  it("graph/T6 [graph/N2, graph/A2]: a 100 000-member chain and ring terminate without recursion exhausting the stack, and the ring is one cycle", () => {
    const [cycles, reach] = ["cycles", "reach"].map(exported);
    const n = 100_000;
    const key = (i) => `n${String(i).padStart(6, "0")}`;
    const chain = new Map(Array.from({ length: n }, (_, i) => [key(i), i + 1 < n ? [key(i + 1)] : []]));
    assert.deepEqual(cycles(chain), []);
    assert.equal([...reach(chain, key(0))].length, n);
    const ring = new Map(Array.from({ length: n }, (_, i) => [key(i), [key((i + 1) % n)]]));
    const found = cycles(ring);
    assert.equal(found.length, 1);
    assert.equal(found[0].length, n);
  });

  it("graph/T7 [graph/N3, graph/F4]: the input is unchanged, the results are frozen, and a plain object works like a Map", () => {
    const [cycles, reach, reverse] = ["cycles", "reach", "reverse"].map(exported);
    const s = { b: ["a"], a: ["b"] };
    const before = JSON.stringify(s);
    const found = cycles(s);
    assert.deepEqual(found, cycles(map(s)));
    assert.deepEqual([...reach(s, "a")], [...reach(map(s), "a")]);
    reverse(s);
    assert.equal(JSON.stringify(s), before);
    assert.ok(Object.isFrozen(found) && found.every(Object.isFrozen));
  });
});
