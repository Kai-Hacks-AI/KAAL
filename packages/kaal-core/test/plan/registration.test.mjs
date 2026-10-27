// core/C24 planned outer tests: Capability Registration and One-Way Traceability.
// Immutable to DO and CHECK; core/C26 turns them GREEN. Each title names the
// contracts it checks (plan/registration/*.md). They use kaal-core's public
// interface only, and give registrations as their frontmatter content.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** A kaal-core subpath, or the reason the tests are blocked before any behavioural assertion. */
async function subpath(name) {
  try {
    return await import(`kaal-core/${name}`);
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./${name} (${e.code ?? e.message})`);
  }
}

/** `assemble` from kaal-core/registration. */
async function assembler() {
  const { assemble } = await subpath("registration");
  assert.equal(typeof assemble, "function", "blocked before behavioural assertion: kaal-core/registration exports no assemble");
  return assemble;
}

/** A registration: the kinds it defines with their rules, and the artifacts it owns with their traces. */
const reg = (capability, namespace, kinds = {}, artifacts = {}) => ({ capability, namespace, kinds, artifacts });

/** The kind owners' registrations of the Owner-corrected rules (core/F51), owning no artifacts. */
const KINDS = [
  reg("kaal-change", "change", { C: { traces: [] } }),
  reg("kaal-intent", "intent", { I: { traces: ["C"] } }),
  reg("kaal-requirements", "requirements", { F: { traces: ["I"] }, N: { traces: ["I"] }, D: { traces: ["T"] } }),
  reg("kaal-architecture", "architecture", { A: { traces: ["F", "N", "D"] } }),
  reg("kaal-testing", "testing", { T: { traces: ["I", "F", "N", "A"] } }),
  reg("kaal-engineering", "engineering", { Code: { traces: ["T"] } }),
];

/** One Capability's artifacts, one of each kind, traced along every permitted step. */
const SAMPLE = reg("kaal-sample", "sample", {}, {
  "sample/C1": { traces: [] },
  "sample/I1": { traces: ["sample/C1"] },
  "sample/F1": { traces: ["sample/I1"] },
  "sample/N1": { traces: ["sample/I1"] },
  "sample/D1": { traces: ["sample/T2"] },
  "sample/A1": { traces: ["sample/F1", "sample/N1", "sample/D1"] },
  "sample/T1": { traces: ["sample/A1", "sample/F1"] },
  "sample/T2": { traces: ["sample/I1"] },
  "sample/Code1": { traces: ["sample/T1"] },
});

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

describe("Capability registration and one-way traceability (core/C24)", () => {
  it("core/T50 [core/I15, core/F49]: two claims of one namespace are a collision naming both, and none of its artifacts resolves", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, SAMPLE, reg("kaal-other", "sample", {}, { "sample/F9": { traces: [] } }), reg("kaal-probe", "probe", {}, { "probe/T1": { traces: ["sample/F1"] } })]);
    assert.ok(naming(r.findings, "sample", "kaal-sample", "kaal-other").length > 0, "the collision names the namespace and both claimants");
    assert.ok(naming(r.findings, "probe/T1", "sample/F1").length > 0, "a trace into a collided namespace does not resolve");
    const stray = assemble([...KINDS, SAMPLE, reg("kaal-other", "other", {}, { "sample/F9": { traces: [] } })]);
    assert.ok(naming(stray.findings, "sample/F9", "kaal-other").length > 0, "an artifact outside the registrant's own namespace is a finding");
  });

  it("core/T51 [core/F48, core/A26]: testing/F2 is Testing's artifact of kind F, owned by its namespace and ruled by F's owner, and its identity is unchanged", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, reg("kaal-sample", "sample", {}, { "sample/I1": { traces: [] }, "sample/F2": { traces: ["sample/I1"] } })]);
    const f2 = r.artifacts.find((a) => a.id === "sample/F2");
    assert.ok(f2, "sample/F2 is assembled under its own identity");
    assert.equal(f2.owner, "kaal-sample", "the namespace's claimant owns it");
    assert.equal(f2.kind, "F", "its kind is F");
    assert.equal(r.kinds.find((k) => k.kind === "F").owner, "kaal-requirements", "F's rule is the kind owner's");
    assert.ok(!r.artifacts.some((a) => a.id === "requirements/F2"), "nothing is moved into the kind owner's namespace");
    assert.deepEqual(r.findings, [], "an F owned by another Capability than F's owner is no finding");
  });

  it("core/T52 [core/F50]: two definitions of one kind are a collision naming both, and an artifact of an undefined kind is a finding", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, reg("kaal-rival", "rival", { F: { traces: ["A"] } })]);
    assert.ok(naming(r.findings, "F", "kaal-requirements", "kaal-rival").length > 0, "the kind collision names both definers");
    const u = assemble([...KINDS, reg("kaal-sample", "sample", {}, { "sample/Q1": { traces: [] } })]);
    assert.ok(naming(u.findings, "sample/Q1", "Q").length > 0, "an artifact of a kind no one defines is a finding");
  });

  it("core/T53 [core/I16, core/F51, core/F52]: every Owner-corrected trace is permitted, and a trace its source kind's rule omits is a finding naming source, target and rule", async () => {
    const assemble = await assembler();
    assert.deepEqual(assemble([...KINDS, SAMPLE]).findings, [], "the permitted steps give no finding");
    for (const [source, target] of [
      ["sample/F1", "sample/A1"],
      ["sample/I1", "sample/F1"],
      ["sample/T1", "sample/Code1"],
      ["sample/A1", "sample/T1"],
      ["sample/D1", "sample/A1"],
    ]) {
      const artifacts = { ...SAMPLE.artifacts, [source]: { traces: [...SAMPLE.artifacts[source].traces, target] } };
      const r = assemble([...KINDS, reg("kaal-sample", "sample", {}, artifacts)]);
      assert.ok(naming(r.findings, source, target).length > 0, `${source} → ${target} is not permitted`);
    }
  });

  it("core/T54 [core/F51, core/F52]: a C artifact traces to nothing, an artifact never traces to itself, and the rule holds across namespaces", async () => {
    const assemble = await assembler();
    const c = assemble([...KINDS, reg("kaal-sample", "sample", {}, { ...SAMPLE.artifacts, "sample/C1": { traces: ["sample/I1"] } })]);
    assert.ok(naming(c.findings, "sample/C1", "sample/I1").length > 0, "Change has no outgoing trace");
    const self = assemble([...KINDS, reg("kaal-sample", "sample", {}, { ...SAMPLE.artifacts, "sample/T1": { traces: ["sample/T1"] } })]);
    assert.ok(naming(self.findings, "sample/T1").length > 0, "a trace to itself is a finding");
    const across = assemble([...KINDS, SAMPLE, reg("kaal-probe", "probe", {}, { "probe/T1": { traces: ["sample/F1"] }, "probe/F1": { traces: ["sample/A1"] } })]);
    assert.equal(naming(across.findings, "probe/T1").length, 0, "T → F across namespaces is permitted");
    assert.ok(naming(across.findings, "probe/F1", "sample/A1").length > 0, "F → A is not, whatever the namespaces");
  });

  it("core/T55 [core/F52, core/F55]: a target that does not resolve is a finding, and nothing is inferred for it", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, reg("kaal-sample", "sample", {}, { ...SAMPLE.artifacts, "sample/T1": { traces: ["sample/F7", "nowhere/I1"] } })]);
    assert.ok(naming(r.findings, "sample/T1", "sample/F7").length > 0, "an unknown identity in a claimed namespace is a finding");
    assert.ok(naming(r.findings, "sample/T1", "nowhere/I1").length > 0, "an unclaimed namespace is a finding");
    assert.ok(!r.artifacts.some((a) => a.id === "sample/F7" || a.id === "nowhere/I1"), "no artifact is made up for a dangling target");
  });

  it("core/T56 [core/N15, core/F54]: incoming views are derived from outgoing traces, and a registration stating an incoming trace is refused", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, SAMPLE]);
    const into = (id) => r.incoming(id).map((t) => t.source).sort();
    assert.deepEqual(into("sample/I1"), ["sample/F1", "sample/N1", "sample/T2"], "I1's incoming traces are the ones going out to it");
    assert.deepEqual(into("sample/T1"), ["sample/Code1"]);
    assert.deepEqual(r.outgoing("sample/A1").map((t) => t.target).sort(), ["sample/D1", "sample/F1", "sample/N1"]);
    const reverse = assemble([...KINDS, reg("kaal-sample", "sample", {}, { ...SAMPLE.artifacts, "sample/I1": { traces: ["sample/C1"], tracedBy: ["sample/F1"] } })]);
    assert.ok(naming(reverse.findings, "sample/I1", "tracedBy").length > 0, "an incoming trace is never stated");
  });

  it("core/T57 [core/F53, core/A27]: traces are followed recursively, and a cycle of trace instances is a finding naming its artifacts", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, SAMPLE]);
    const reached = r.reach("sample/Code1").map((a) => (typeof a === "string" ? a : a.id));
    for (const id of ["sample/T1", "sample/A1", "sample/F1", "sample/I1", "sample/C1"]) assert.ok(reached.includes(id), `Code1 reaches ${id}`);
    const cyclic = { ...SAMPLE.artifacts, "sample/T2": { traces: ["sample/A1"] } };
    const c = assemble([...KINDS, reg("kaal-sample", "sample", {}, cyclic)]);
    assert.ok(naming(c.findings, "sample/A1", "sample/D1", "sample/T2").length > 0, "A1 → D1 → T2 → A1 is a cycle finding");
  });

  it("core/T58 [core/I16, core/F55, core/F56]: an artifact that states no trace is reported untraced, not failed and not inferred", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, reg("kaal-sample", "sample", {}, { ...SAMPLE.artifacts, "sample/F3": { traces: [] } })]);
    assert.ok(r.untraced.some((a) => (typeof a === "string" ? a : a.id) === "sample/F3"), "F3 is untraced");
    assert.equal(naming(r.findings, "sample/F3").length, 0, "untraced is no finding");
    assert.deepEqual(r.outgoing("sample/F3"), [], "no trace is inferred");
  });

  it("core/T59 [core/N14, core/N16]: the same registrations in any order give the same result, and none give an empty result with no findings", async () => {
    const assemble = await assembler();
    const strip = (r) => JSON.parse(JSON.stringify({ namespaces: r.namespaces, kinds: r.kinds, artifacts: r.artifacts, findings: r.findings, untraced: r.untraced }));
    const all = [...KINDS, SAMPLE, reg("kaal-other", "sample", {}, {})];
    assert.deepEqual(strip(assemble(all)), strip(assemble([...all].reverse())), "order does not matter");
    const none = assemble([]);
    assert.deepEqual([none.namespaces, none.kinds, none.artifacts, none.findings, none.untraced].map((x) => x.length), [0, 0, 0, 0, 0]);
  });
});
