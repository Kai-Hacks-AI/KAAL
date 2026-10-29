// change/C1 planned outer tests: Change Nodes and their dependencies.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/dependencies/*.md). They use kaal-change's
// public interface and its shipped Definitions, and build Nodes with Graph.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createNode, identify } from "kaal-graph";

const CAPABILITY = fileURLToPath(new URL("../../capability/", import.meta.url));
const ref = (node) => ({ name: node.name, id: node.id });

/** `assess` from kaal-change/dependencies, or the reason the tests are blocked before any behavioural assertion. */
async function assessor() {
  let mod;
  try {
    mod = await import("kaal-change/dependencies");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-change exports no ./dependencies (${e.code ?? e.message})`);
  }
  assert.equal(typeof mod.assess, "function", "blocked before behavioural assertion: kaal-change/dependencies exports no assess");
  return mod.assess;
}

/** A shipped Definition, or the reason the tests are blocked. */
function definition(file) {
  const path = CAPABILITY + file;
  assert.ok(existsSync(path), `blocked before behavioural assertion: kaal-change ships no capability/${file}`);
  return identify(readFileSync(path));
}

/** What every test needs: assess, the Change and Depends On Definitions, and a Change Node builder. */
async function fixture() {
  const assess = await assessor();
  const definitions = [definition("Change-Definition.md"), definition("Depends-On.md")];
  const [CHANGE, DEPENDS_ON] = definitions.map(ref);
  /** A Change Node named `name` that depends on the given Nodes. */
  const change = (name, deps = [], frontmatter = {}, body = `# ${name}\n`) =>
    identify(createNode({
      name,
      type: CHANGE,
      ...(deps.length ? { edges: [{ type: DEPENDS_ON, targets: deps.map(ref) }] } : {}),
      frontmatter,
      body,
    }).bytes);
  return { assess, definitions, CHANGE, DEPENDS_ON, change };
}

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

describe("Change Nodes and their dependencies (change/C1)", () => {
  it("change/T1 [change/I1, change/F1, change/F2]: a Node typed by the Change Definition is a Change under its identity, and a malformed identity is a finding", async () => {
    const { assess, definitions, change } = await fixture();
    const good = change("sample/C1");
    const r = assess([...definitions, good]);
    assert.deepEqual(r.changes.map((c) => c.identity), ["sample/C1"], "the Change is known by its identity");
    assert.equal(r.changes[0].id, good.id, "and carries its Node id");
    assert.deepEqual(r.findings, [], "a well-formed Change is no finding");
    for (const bad of ["sample/c1", "sample/C01", "sample/C0", "C1", "sample/C1a", "sample/T1"]) {
      const b = assess([...definitions, change(bad)]);
      assert.ok(naming(b.findings, bad).length > 0, `${bad} is a malformed identity`);
      assert.ok(!b.changes.some((c) => c.identity === bad), `${bad} is not walked as a Change`);
    }
  });

  it("change/T2 [change/F2]: two Change Nodes with one identity are a finding, and neither is walked", async () => {
    const { assess, definitions, change } = await fixture();
    const one = change("sample/C1", [], {}, "one\n");
    const other = change("sample/C1", [], {}, "other\n");
    const r = assess([...definitions, one, other, change("sample/C2", [one])]);
    assert.ok(naming(r.findings, "sample/C1", one.id, other.id).length > 0, "the duplicate identity names both Nodes");
    assert.ok(!r.changes.some((c) => c.identity === "sample/C1"), "neither Node is walked");
    assert.deepEqual(r.dependsOn("sample/C2"), [], "a dependency on a duplicated identity is not walked");
  });

  it("change/T3 [change/I2, change/N2, change/F5]: a dependency is stated by the dependent alone, and its reverse is derived", async () => {
    const { assess, definitions, change } = await fixture();
    const a = change("sample/C1");
    const b = change("sample/C2", [a]);
    const r = assess([...definitions, a, b]);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.dependsOn("sample/C2"), ["sample/C1"], "the dependent states its dependency");
    assert.deepEqual(r.dependsOn("sample/C1"), [], "the dependency states nothing");
    assert.deepEqual(r.dependents("sample/C1"), ["sample/C2"], "what it blocks is derived");
    assert.equal(a.frontmatter.edges, undefined, "nothing was written into the dependency");
  });

  it("change/T4 [change/F5, change/A3]: the transitive views follow the Edges all the way, in both directions", async () => {
    const { assess, definitions, change } = await fixture();
    const c1 = change("x/C1");
    const c2 = change("y/C2", [c1]);
    const c3 = change("x/C3", [c2]);
    const c4 = change("z/C4", [c1, c3]);
    const r = assess([...definitions, c4, c3, c2, c1]);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.dependsOn("z/C4"), ["x/C1", "x/C3"], "direct dependencies, sorted");
    assert.deepEqual(r.dependsOn("z/C4", { transitive: true }), ["x/C1", "x/C3", "y/C2"], "transitive dependencies, across namespaces, once each");
    assert.deepEqual(r.dependents("x/C1"), ["y/C2", "z/C4"], "direct dependents, sorted");
    assert.deepEqual(r.dependents("x/C1", { transitive: true }), ["x/C3", "y/C2", "z/C4"], "everything it blocks");
  });

  it("change/T5 [change/F4]: an unresolved target and a target that is not a Change are findings", async () => {
    const { assess, definitions, change } = await fixture();
    const absent = change("sample/C9");
    const b = change("sample/C2", [absent]);
    const r = assess([...definitions, b]);
    assert.ok(naming(r.findings, "sample/C2", "sample/C9", "unresolved").length > 0, "a target that is not present is unresolved");
    assert.deepEqual(r.dependsOn("sample/C2"), [], "an unresolved Edge is not listed");
    const [changeDefinition] = definitions;
    const c = change("sample/C3", [changeDefinition]);
    const s = assess([...definitions, c]);
    assert.ok(naming(s.findings, "sample/C3", changeDefinition.id, "not a Change").length > 0, "a target of another type is not a Change");
    assert.deepEqual(s.dependsOn("sample/C3"), []);
  });

  it("change/T6 [change/F4, change/A4]: a target edited after it was pinned is stale, and is reported, not repaired", async () => {
    const { assess, definitions, change } = await fixture();
    const before = change("sample/C1", [], {}, "as planned\n");
    const after = change("sample/C1", [], {}, "as edited\n");
    const b = change("sample/C2", [before]);
    const r = assess([...definitions, after, b]);
    assert.ok(naming(r.findings, "sample/C2", "sample/C1", before.id, "stale").length > 0, "the stale pin names the dependent, the identity and the pinned id");
    assert.deepEqual(r.dependsOn("sample/C2"), [], "a stale Edge is not listed");
    assert.deepEqual(r.dependents("sample/C1"), [], "and is not reversed onto the edited Change");
    assert.equal(r.changes.find((c) => c.identity === "sample/C2").id, b.id, "the dependent is unchanged");
  });

  it("change/T7 [change/I3, change/F3, change/F6]: priority, rank, order and state are not a Change Node's to hold", async () => {
    const { assess, definitions, change } = await fixture();
    for (const key of ["priority", "rank", "order", "state"]) {
      const r = assess([...definitions, change("sample/C1", [], { [key]: "1" })]);
      assert.ok(naming(r.findings, "sample/C1", key).length > 0, `${key} is a finding`);
    }
    const r = assess([...definitions, change("sample/C1", [], { title: "kept" })]);
    assert.deepEqual(r.findings, [], "other keys are the Change's own");
    for (const c of r.changes) for (const key of ["priority", "rank", "order", "state"]) assert.ok(!(key in c), `the result carries no ${key}`);
  });

  it("change/T8 [change/N1, change/I4]: order does not matter, other Nodes are ignored, and no Changes give an empty result", async () => {
    const { assess, definitions, change } = await fixture();
    const a = change("sample/C1");
    const b = change("sample/C2", [a]);
    const nodes = [...definitions, a, b];
    const forward = assess(nodes);
    const backward = assess([...nodes].reverse());
    assert.deepEqual(backward.changes, forward.changes);
    assert.deepEqual(backward.findings, forward.findings);
    assert.deepEqual(backward.dependents("sample/C1"), forward.dependents("sample/C1"));
    const none = assess(definitions);
    assert.deepEqual(none.changes, [], "the Definitions are not Changes");
    assert.deepEqual(none.findings, [], "no Changes is no finding");
    assert.deepEqual(assess([]).changes, []);
  });

  it("change/T17 [change/F4, change/F12, change/A4]: under content addressing, closing a cycle edits a pinned Change, so the attempt is a stale pin and never a cycle", async () => {
    const { assess, definitions, change } = await fixture();
    const a = change("sample/C1");
    const b = change("sample/C2", [a]);
    const closing = change("sample/C1", [b]);
    assert.notEqual(closing.id, a.id, "stating the dependency changes the Change's bytes, and so its id");
    const r = assess([...definitions, closing, b]);
    assert.ok(naming(r.findings, "sample/C2", "sample/C1", a.id, "stale").length > 0, "the Edge pinned before the edit is stale");
    assert.deepEqual(naming(r.findings, "cycle"), [], "no cycle resolves, so none is reported");
    assert.deepEqual(r.dependsOn("sample/C1", { transitive: true }), ["sample/C2"], "the new Edge resolves");
    assert.deepEqual(r.dependsOn("sample/C2", { transitive: true }), [], "the stale Edge is not walked");
    assert.deepEqual(r.dependents("sample/C1", { transitive: true }), [], "nor reversed");
  });

  it("change/T18 [change/F12, change/A4]: Nodes whose ids are not their bytes' hash can state a cycle, which is a finding naming its Changes, and the views still terminate", async () => {
    const { assess, definitions, change } = await fixture();
    // Graph takes any frozen Node as identify() shapes it and does not recompute its id,
    // so these ids are asserted, not derived from bytes.
    const ID = { A: "a".repeat(64), B: "b".repeat(64), C: "c".repeat(64) };
    const forged = (name, id, deps) => {
      const n = change(name, deps.map(([depName, depId]) => ({ name: depName, id: depId })));
      return Object.freeze({ ...n, id });
    };
    const a = forged("sample/C1", ID.A, [["sample/C2", ID.B]]);
    const b = forged("sample/C2", ID.B, [["sample/C1", ID.A]]);
    const self = forged("sample/C3", ID.C, [["sample/C3", ID.C]]);
    const r = assess([...definitions, a, b, self]);
    assert.ok(naming(r.findings, "cycle", "sample/C1", "sample/C2").length > 0, "the cycle names each of its Changes");
    assert.ok(naming(r.findings, "cycle", "sample/C3").length > 0, "a Change depending on itself is a cycle");
    assert.deepEqual(r.dependsOn("sample/C1", { transitive: true }), ["sample/C2"], "the walk terminates and never lists the start");
    assert.deepEqual(r.dependents("sample/C1", { transitive: true }), ["sample/C2"]);
    assert.deepEqual(r.dependsOn("sample/C3", { transitive: true }), [], "a Change is never its own dependency");
    assert.deepEqual(r.dependents("sample/C3"), []);
    const acyclic = assess([...definitions, change("sample/C1"), change("sample/C4")]);
    assert.deepEqual(naming(acyclic.findings, "cycle"), [], "without a cycle there is no cycle finding");
  });
});
