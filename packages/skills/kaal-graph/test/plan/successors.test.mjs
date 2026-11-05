// graph/C14 planned test: a Graph's Nodes as a structure (plan/successors/testing.md).
// Immutable to DO and CHECK; graph/C15 turns it GREEN. It uses kaal-graph's public interface only.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createNode, Graph, identifyRoot, reach, reverse } from "kaal-graph";

const ref = (n) => ({ name: n.name, id: n.id });
const root = (name) => identifyRoot(Buffer.from(`---\nname: ${name}\n---\n\n# ${name}\n`));
const kind = ref(root("Kind"));
const serves = root("Serves");
const refines = root("Refines");
const node = (name, groups = []) => createNode({ name, type: kind, edges: groups.map(([type, targets]) => ({ type: ref(type), targets: targets.map(ref) })) }).node;

describe("a Graph's Nodes as a structure", () => {
  const intent = node("Intent");
  const lone = node("Lone");
  const r1 = node("R1", [[serves, [intent]]]);
  const r2 = node("R2", [[serves, [intent]], [refines, [r1]]]);
  const away = node("Away");
  const r3 = node("R3", [[serves, [intent, away]]]);
  const nodes = [serves, refines, intent, lone, r1, r2, r3];
  const sorted = (...ns) => ns.map((n) => n.id).sort();

  it("graph/T18 [graph/F14, graph/F15, graph/N10]: successors is the relation reach, reverse, cycles and path take", () => {
    const g = new Graph(nodes);
    const all = g.successors();
    // Every held Node is a key; an Edge-less Node maps to nothing.
    assert.deepEqual([...all.keys()].sort(), nodes.map((n) => n.id).sort());
    assert.deepEqual([...all.get(lone.id)], []);
    // All Edges, targets sorted and held only: Away is not held, so R3 does not point to it.
    assert.deepEqual([...all.get(r2.id)], sorted(intent, r1));
    assert.deepEqual([...all.get(r3.id)], sorted(intent));
    // One Edge type: exactly that type.
    const onlyServes = g.successors({ type: serves.id });
    assert.deepEqual([...onlyServes.get(r2.id)], sorted(intent));
    assert.deepEqual([...g.successors({ type: refines.id }).get(r2.id)], sorted(r1));
    assert.deepEqual([...g.successors({ type: "f".repeat(64) }).get(r2.id)], []);
    // The same whatever order Nodes were added in, and read-only.
    const reversed = new Graph([...nodes].reverse()).successors();
    assert.deepEqual([...reversed].map(([id, l]) => [id, [...l]]), [...all].map(([id, l]) => [id, [...l]]));
    assert.equal(typeof all.set, "undefined");
    assert.equal(typeof all.delete, "undefined");
    // The incoming relation is derived by reverse.
    assert.deepEqual([...reverse(onlyServes).get(intent.id)], sorted(r1, r2, r3));
    // Consistent with traverse, for every Node and each choice of type.
    for (const n of nodes) {
      for (const type of [undefined, serves.id, refines.id]) {
        const expected = [...g.traverse(n.id, { type })].map((s) => s.id);
        assert.deepEqual([...reach(g.successors({ type }), n.id)], expected, `${n.name} ${type ?? "all"}`);
      }
    }
    // The graph itself is unchanged.
    assert.ok(g.check().some((problem) => /Away/.test(problem)), "the unresolved Away reference is check()'s to report");
    assert.deepEqual(g.out(r2.id).length, 2);
  });
});
