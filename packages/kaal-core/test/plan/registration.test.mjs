// core/C24 planned outer tests: Capability Registration and One-Way Traceability,
// as revised by core/C30. Immutable to DO and CHECK; core/C26 turns them GREEN. Each title names the
// contracts it checks (plan/registration/*.md). They use kaal-core's public
// interface only, and give registrations as their frontmatter content.
// The kinds and rules here are fixtures: Core prescribes none (core/F51).
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

/** A registration: its holder and scope, the kinds it defines with their rules, and the instances it holds. */
const reg = (holder, scope, kinds = {}, instances = []) => ({ holder, scope, kinds, instances });

/** An instance: its identity, its stated kind (a name in the holder's own scope, or a kind reference), and its outgoing traces. */
const inst = (id, kind, ...traces) => ({ id, kind, traces });

/** A trace target in another scope. */
const at = (scope, id) => ({ scope, id });

/** A kind defined in another scope: a kind is qualified by its owner's scope (core/F50). */
const kind = (scope, name) => ({ scope, kind: name });
const C = kind("change", "C");
const I = kind("intent", "I");
const F = kind("requirements", "F");
const N = kind("requirements", "N");
const D = kind("requirements", "D");
const A = kind("architecture", "A");
const T = kind("testing", "T");
const Code = kind("engineering", "Code");

/** Fixture kind owners, owning no instances. Testing leaves its kind open. A Test Case traces to the Defect it tests (#583). */
const KINDS = [
  reg("kaal-change", "change", { C: { traces: [] } }),
  reg("kaal-intent", "intent", { I: { traces: [C] } }),
  reg("kaal-requirements", "requirements", { F: { traces: [I] }, N: { traces: [I] }, D: { traces: [] } }),
  reg("kaal-architecture", "architecture", { A: { traces: [F, N, D] } }),
  reg("kaal-testing", "testing", { T: { traces: "any" } }),
  reg("kaal-engineering", "engineering", { Code: { traces: [T] } }),
];

/** Content held by a consuming repository, whose identities follow no shared grammar. */
const ACME = [
  inst("CHG-1", C),
  inst("WHY-1", I, "CHG-1"),
  inst("REQ-001", F, "WHY-1"),
  inst("NFR.1", N, "WHY-1"),
  inst("defect:1", D),
  inst("bb/store", A, "REQ-001", "NFR.1", "defect:1"),
  inst("case 1", T, "bb/store", "REQ-001"),
  inst("case 2", T, "defect:1"),
  inst("src/store.ts", Code, "case 1"),
];
const SAMPLE = reg("acme-product", "acme", {}, ACME);

/** ACME with one instance's traces replaced. */
const retrace = (id, ...traces) => reg("acme-product", "acme", {}, ACME.map((i) => (i.id === id ? { ...i, traces } : i)));

/** Whether a kind reference names the kind `name` defined in `scope`. */
const is = (ref, scope, name) => ref.scope === scope && ref.kind === name;

/** KINDS with the given kinds declared `acyclic` by their owners (core/F51). */
const declaring = (...acyclic) =>
  KINDS.map((r) => ({ ...r, kinds: Object.fromEntries(Object.entries(r.kinds).map(([k, v]) => [k, acyclic.some((a) => is(a, r.scope, k)) ? { ...v, acyclic: true } : v])) }));

/** KINDS with one owner's rule for one of its kinds replaced. */
const ruling = (ref, traces) => KINDS.map((r) => (r.scope === ref.scope ? { ...r, kinds: { ...r.kinds, [ref.kind]: { traces } } } : r));

/** SAMPLE with "case 1" also tracing to "src/store.ts", closing case 1 → src/store.ts → case 1. */
const CYCLIC = retrace("case 1", "bb/store", "REQ-001", "src/store.ts");

/** The findings, or cycles, whose text names every given word. */
const naming = (xs, ...words) => xs.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

/** The identities of a list of instances. */
const ids = (xs) => xs.map((a) => a.id);

describe("Capability registration and one-way traceability (core/C24)", () => {
  it("core/T50 [core/I15, core/F49]: two claims of one scope are a collision naming both, none of its instances resolves, and one identity stated twice in a scope is a finding", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, SAMPLE, reg("acme-fork", "acme", {}, [inst("REQ-9", F)]), reg("probe", "probe", {}, [inst("p1", T, at("acme", "REQ-001"))])]);
    assert.ok(naming(r.findings, "acme", "acme-product", "acme-fork").length > 0, "the collision names the scope and both holders");
    assert.ok(naming(r.findings, "p1", "REQ-001").length > 0, "a trace into a collided scope does not resolve");
    const twice = assemble([...KINDS, reg("acme-product", "acme", {}, [...ACME, inst("REQ-001", N, "WHY-1")])]);
    assert.ok(naming(twice.findings, "REQ-001", "acme").length > 0, "an identity stated twice in one scope is a finding");
  });

  it("core/T51 [core/F48, core/A26]: an identity is opaque text, unique within its scope; the kind is the stated one, never read from the spelling; and content held outside its kind owner keeps its own identity", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, SAMPLE, reg("other", "other", {}, [inst("requirements/F2", A), inst("REQ-001", N, at("acme", "WHY-1"))])]);
    assert.deepEqual(r.findings, [], "identities in any spelling, and content held by a consumer, give no finding");
    const req = r.instances.find((a) => a.scope === "acme" && a.id === "REQ-001");
    assert.ok(req, "REQ-001 is assembled under its own identity");
    assert.equal(req.holder, "acme-product", "the scope's holder holds it, not F's owner");
    assert.deepEqual(req.kind, F, "its kind is the stated one, qualified by its owner's scope");
    assert.equal(r.kinds.find((k) => is(k, "requirements", "F")).owner, "kaal-requirements", "F's rule is the kind owner's");
    const lookalike = r.instances.find((a) => a.id === "requirements/F2");
    assert.deepEqual(lookalike.kind, A, "a spelling that looks like another kind changes nothing");
    assert.equal(lookalike.scope, "other", "nor does it move the instance into another scope");
    assert.equal(r.instances.filter((a) => a.id === "REQ-001").length, 2, "one identity in two scopes is two instances");
  });

  it("core/T52 [core/F50, core/F51]: a kind is qualified by its owner's scope, so two Capabilities naming a concept alike define two kinds with their own rules; a kind in a collided scope does not resolve; an instance of an undefined kind, and a rule naming an undefined kind, are findings", async () => {
    const assemble = await assembler();
    const rival = reg("kaal-rival", "rival", { F: { traces: [] } });
    const both = reg("acme-product", "acme", {}, [inst("WHY-1", I), inst("REQ-001", F, "WHY-1"), inst("r-1", kind("rival", "F"), "WHY-1")]);
    const r = assemble([...KINDS, rival, both]);
    assert.equal(naming(r.findings, "collision").length, 0, "two Capabilities' F are two kinds, not a collision");
    assert.equal(r.kinds.filter((k) => k.kind === "F").length, 2, "each is its own owner's kind");
    assert.equal(naming(r.findings, "REQ-001").length, 0, "requirements' F is judged by requirements' rule");
    assert.ok(naming(r.findings, "r-1", "WHY-1", "rule").length > 0, "rival's F is judged by rival's rule");
    const collided = assemble([...KINDS, reg("kaal-x", "x", { X: { traces: "any" } }), reg("kaal-y", "x", { X: { traces: "any" } }), reg("acme-product", "acme", {}, [inst("q-1", kind("x", "X"))])]);
    assert.ok(naming(collided.findings, "x", "kaal-x", "kaal-y").length > 0, "the scope collision names both holders");
    assert.ok(naming(collided.findings, "q-1", "X").length > 0, "a kind defined in a collided scope does not resolve");
    const u = assemble([...KINDS, reg("acme-product", "acme", {}, [inst("Q-1", "Q"), inst("Q-2", kind("requirements", "Q"))])]);
    assert.ok(naming(u.findings, "Q-1", "Q").length > 0, "an instance of a kind no one defines is a finding");
    assert.ok(naming(u.findings, "Q-2", "requirements", "Q").length > 0, "so is one naming a kind its scope's owner does not define");
    const listed = assemble([...KINDS, reg("kaal-x", "x", { X: { traces: ["Ghost", kind("intent", "Ghost")] } })]);
    assert.ok(naming(listed.findings, "kaal-x", "Ghost").length > 0, "a rule naming a kind no one defines is a finding naming its owner");
    assert.ok(naming(listed.findings, "kaal-x", "intent", "Ghost").length > 0, "whatever scope it names");
  });

  it("core/T53 [core/I16, core/F51, core/F52]: what is permitted is exactly what the registered rules permit, and the same instances under another rule get another verdict", async () => {
    const assemble = await assembler();
    assert.deepEqual(assemble([...KINDS, SAMPLE]).findings, [], "the registered steps give no finding");
    // Each step its source kind's rule omits stands alone, so no cycle can stand in for the rule.
    for (const [sourceKind, targetKind] of [[F, A], [I, F], [A, T], [D, A], [Code, A]]) {
      const r = assemble([...KINDS, reg("acme-product", "acme", {}, [inst("s", sourceKind, "t"), inst("t", targetKind)])]);
      assert.ok(naming(r.findings, '"s"', '"t"', "rule").length > 0, `${sourceKind.kind} → ${targetKind.kind} is not permitted by its rule`);
    }
    // No matrix is built in: F's owner now permits F → A, and no longer F → I.
    const pair = (to) => reg("acme-product", "acme", {}, [inst("WHY-1", I), inst("bb/store", A), inst("REQ-001", F, to === I ? "WHY-1" : "bb/store")]);
    assert.deepEqual(assemble([...ruling(F, [A]), pair(A)]).findings, [], "F → A is permitted once F's owner registers it");
    assert.ok(naming(assemble([...ruling(F, [A]), pair(I)]).findings, "REQ-001", "WHY-1", "rule").length > 0, "F → I is refused once F's owner drops it");
  });

  it("core/T54 [core/F51, core/F52, core/F53]: an empty rule permits nothing, an open rule permits any registered kind, a self-trace is a cycle of one judged by its kind owner's declaration, and rules hold across scopes", async () => {
    const assemble = await assembler();
    const c = assemble([...KINDS, reg("acme-product", "acme", {}, [inst("CHG-1", C, "WHY-1"), inst("WHY-1", I)])]);
    assert.ok(naming(c.findings, "CHG-1", "WHY-1", "rule").length > 0, "an empty rule permits no trace");
    // T is open: it may trace to Code, to T, and to a kind registered after it.
    const open = assemble([...KINDS, reg("kaal-x", "x", { X: { traces: [] } }), reg("acme-product", "acme", {}, [...ACME, inst("x-1", kind("x", "X")), inst("case 3", T, "src/store.ts", "case 1", "x-1")])]);
    assert.deepEqual(open.findings, [], "an open rule permits a trace to any registered kind");
    const dangling = assemble([...KINDS, reg("acme-product", "acme", {}, [inst("case 3", T, "nothing-here")])]);
    assert.ok(naming(dangling.findings, "case 3", "nothing-here").length > 0, "an open rule does not resolve a missing target");
    // X's rule permits X, so only the cycle contract can judge x-1 → x-1.
    const selfTrace = (decl) => reg("kaal-x", "x", { X: { traces: ["X"], ...decl } }, [inst("x-1", "X", "x-1")]);
    const permitted = assemble([...KINDS, selfTrace({})]);
    assert.ok(naming(permitted.cycles, "x-1").length > 0, "a self-trace is observed as a cycle of one");
    assert.deepEqual(permitted.findings, [], "with no acyclic declaration it is no finding");
    const prohibited = assemble([...KINDS, selfTrace({ acyclic: true })]);
    assert.ok(naming(prohibited.cycles, "x-1").length > 0, "it is still observed");
    assert.ok(naming(prohibited.findings, "x-1", "X", "kaal-x", "acyclic").length > 0, "declared acyclic, it is a finding naming the kind and its owner");
    const across = assemble([...KINDS, SAMPLE, reg("probe", "probe", {}, [inst("p1", T, at("acme", "REQ-001")), inst("p2", F, at("acme", "bb/store"))])]);
    assert.equal(naming(across.findings, "p1").length, 0, "T → F across scopes is permitted");
    assert.ok(naming(across.findings, "p2", "bb/store", "rule").length > 0, "F → A is not, whatever the scopes");
  });

  it("core/T55 [core/F52, core/F55]: a target that does not resolve is a finding, and nothing is inferred for it", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, retrace("case 1", "REQ-404", at("nowhere", "WHY-1"))]);
    assert.ok(naming(r.findings, "case 1", "REQ-404").length > 0, "an unknown identity in a claimed scope is a finding");
    assert.ok(naming(r.findings, "case 1", "nowhere").length > 0, "an unclaimed scope is a finding");
    assert.ok(!r.instances.some((a) => a.id === "REQ-404" || a.scope === "nowhere"), "no instance is made up for a dangling target");
  });

  it("core/T56 [core/N15, core/F54]: incoming views are derived from outgoing traces, and a registration stating an incoming trace is refused", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, SAMPLE]);
    const into = (id) => r.incoming("acme", id).map((t) => t.source.id).sort();
    assert.deepEqual(into("WHY-1"), ["NFR.1", "REQ-001"], "WHY-1's incoming traces are the ones going out to it");
    assert.deepEqual(into("defect:1"), ["bb/store", "case 2"], "a Defect lists no Test Case; the cases testing it are derived");
    assert.deepEqual(into("case 1"), ["src/store.ts"]);
    assert.deepEqual(r.outgoing("acme", "bb/store").map((t) => t.target.id).sort(), ["NFR.1", "REQ-001", "defect:1"]);
    const reverse = assemble([...KINDS, reg("acme-product", "acme", {}, ACME.map((i) => (i.id === "WHY-1" ? { ...i, tracedBy: ["REQ-001"] } : i)))]);
    assert.ok(naming(reverse.findings, "WHY-1", "tracedBy").length > 0, "an incoming trace is never stated");
  });

  it("core/T57 [core/F53, core/N14, core/A27]: traces are followed recursively and terminate on a cycle, every cycle is observed, and only a cycle through a kind declared acyclic is a finding naming that kind and its owner", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, SAMPLE]);
    const reached = ids(r.reach("acme", "src/store.ts"));
    for (const id of ["case 1", "bb/store", "REQ-001", "WHY-1", "CHG-1"]) assert.ok(reached.includes(id), `src/store.ts reaches ${id}`);
    assert.deepEqual(r.cycles, [], "an acyclic graph has no observed cycle");

    // Permitted: no owner of T or Code declared acyclic.
    const permitted = assemble([...KINDS, CYCLIC]);
    const around = ids(permitted.reach("acme", "case 1"));
    assert.equal(new Set(around).size, around.length, "reach terminates on the cycle and yields each instance once");
    for (const id of ["src/store.ts", "bb/store", "defect:1", "REQ-001", "WHY-1", "CHG-1"]) assert.ok(around.includes(id), `case 1 reaches ${id} through the cycle`);
    assert.ok(naming(permitted.cycles, "case 1", "src/store.ts").length > 0, "case 1 → src/store.ts → case 1 is observed, naming its instances");
    assert.deepEqual(permitted.findings, [], "an undeclared cycle is no finding");
    assert.deepEqual(assemble([...declaring(I), CYCLIC]).findings, [], "a declaration on a kind off the cycle does not judge it");

    // Prohibited: Code's owner declares Code acyclic.
    const prohibited = assemble([...declaring(Code), CYCLIC]);
    assert.ok(naming(prohibited.cycles, "case 1", "src/store.ts").length > 0, "the cycle is still observed");
    assert.ok(naming(prohibited.findings, "case 1", "src/store.ts", "kaal-engineering", "acyclic").length > 0, "it is a finding naming its instances, the declared kind's owner and the declaration");

    // Deterministic: the same registrations in any order give the same cycles and findings.
    const pick = (x) => JSON.parse(JSON.stringify({ cycles: x.cycles, findings: x.findings }));
    const all = [...declaring(Code), CYCLIC];
    assert.deepEqual(pick(assemble([...all].reverse())), pick(prohibited), "order does not change the observed cycles or the findings");
  });

  it("core/T58 [core/I16, core/F55, core/F56]: an instance that states no trace is reported untraced, not failed and not inferred", async () => {
    const assemble = await assembler();
    const r = assemble([...KINDS, reg("acme-product", "acme", {}, [...ACME, inst("REQ-002", F)])]);
    assert.ok(r.untraced.some((a) => a.scope === "acme" && a.id === "REQ-002"), "REQ-002 is untraced");
    assert.equal(naming(r.findings, "REQ-002").length, 0, "untraced is no finding");
    assert.deepEqual(r.outgoing("acme", "REQ-002"), [], "no trace is inferred");
  });

  it("core/T59 [core/N14, core/N16]: the same registrations in any order give the same result, and none give an empty result with no findings", async () => {
    const assemble = await assembler();
    const strip = (r) => JSON.parse(JSON.stringify({ scopes: r.scopes, kinds: r.kinds, instances: r.instances, findings: r.findings, untraced: r.untraced }));
    const all = [...KINDS, SAMPLE, reg("acme-fork", "acme")];
    assert.deepEqual(strip(assemble(all)), strip(assemble([...all].reverse())), "order does not matter");
    const none = assemble([]);
    assert.deepEqual([none.scopes, none.kinds, none.instances, none.findings, none.untraced].map((x) => x.length), [0, 0, 0, 0, 0]);
  });

  it("core/T67 [core/F51, core/F53, core/F54]: a hierarchy is a kind whose owner's rule permits its own kind; children state their parent, parents list no children, `acyclic` is the owner's choice, and a cross-tree trace is an ordinary outgoing trace; Core requires no tree", async () => {
    const assemble = await assembler();
    const tree = reg("acme-product", "acme", {}, [
      inst("WHY-1", I),
      inst("REQ-001", F, "WHY-1"),
      inst("REQ-001.1", F, "REQ-001"),
      inst("REQ-001.2", F, "REQ-001"),
      inst("REQ-001.1.1", F, "REQ-001.1"),
      inst("case 1", T, "REQ-001.1.1"),
    ]);
    assert.ok(naming(assemble([...KINDS, tree]).findings, "REQ-001.1", "REQ-001", "rule").length > 0, "F → F is not permitted until F's owner permits it");
    const nested = ruling(F, [I, F]);
    const r = assemble([...nested, tree]);
    assert.deepEqual(r.findings, [], "F's owner permits F → F, and the cross-tree T → F needs nothing more");
    assert.deepEqual(r.incoming("acme", "REQ-001").map((t) => t.source.id).sort(), ["REQ-001.1", "REQ-001.2"], "a parent's children are derived");
    assert.ok(ids(r.reach("acme", "case 1")).includes("WHY-1"), "a case reaches up the tree it traces into");
    const loop = reg("acme-product", "acme", {}, [...tree.instances.filter((i) => i.id !== "REQ-001"), inst("REQ-001", F, "WHY-1", "REQ-001.1.1")]);
    assert.deepEqual(assemble([...nested, loop]).findings, [], "without a declaration, a loop in F is observed, not refused");
    const strict = nested.map((x) => (x.scope === "requirements" ? { ...x, kinds: { ...x.kinds, F: { ...x.kinds.F, acyclic: true } } } : x));
    assert.ok(naming(assemble([...strict, loop]).findings, "REQ-001", "kaal-requirements", "acyclic").length > 0, "declared acyclic by its owner, it is a finding");
  });
});
