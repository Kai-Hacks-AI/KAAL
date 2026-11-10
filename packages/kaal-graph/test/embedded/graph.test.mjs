// Embedded cases (graph/F7): shipped Graph behaviour, run by test/verify.mjs against the copy they ship in.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "@kaihacksai/kaal-hosting";
import { claimsForm, createNode, edgesOf, FormError, Graph, identify, identifyRoot, isId, isName, readFrontmatter, sha256 } from "@kaihacksai/kaal-graph";
import * as form from "@kaihacksai/kaal-graph/form";

// The copy of the package these cases ship in: the installed one, or the source in the repository.
const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(PACKAGE, "skills", "kaal-graph");
const SCRIPT = join(PACKAGE, JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).bin["kaal-graph"]);
// Any Node serves as a type here: Graph gives no type a meaning. This one is a root, read as one.
const f = { definition: { name: "Definition", id: identifyRoot(Buffer.from("---\nname: Definition\n---\n\n# Definition\n")).id } };

const ref = (n) => ({ name: n.name, id: n.id });
const yamlRef = (r, indent) => `${indent}name: ${r.name}\n${indent.replace(/- $/, "  ")}id: ${r.id}\n`;

/** A Node's exact bytes: name, optional type, and edge groups [{ type, targets }]. */
function bytes(name, { type = f.definition, groups = [], raw = "" } = {}) {
  let edges = "";
  if (groups.length) {
    edges = "edges:\n";
    for (const g of groups) {
      edges += `  - type:\n${yamlRef(g.type, "      ")}    targets:\n`;
      for (const t of g.targets) edges += yamlRef(t, "      - ");
    }
  }
  return Buffer.from(`---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n${edges}${raw}---\n\n# ${name}\n`);
}
const make = (...args) => identify(bytes(...args));

describe("the Form", () => {
  const T = { name: "Node", id: "c".repeat(64) };
  const node = (name, type, body = `# ${name}\n`) => `---\nname: ${name}\n${type ? `type:\n  name: ${type.name}\n  id: ${type.id}\n` : ""}---\n\n${body}`;

  it("gives a Node the SHA-256 of its exact bytes as its id, changing with any byte", () => {
    const bytes = Buffer.from(node("A", T));
    assert.deepEqual(identify(bytes), { id: sha256(bytes), name: "A", type: T, frontmatter: { name: "A", type: T } });
    assert.notEqual(identify(Buffer.from(node("A", T) + " ")).id, identify(bytes).id);
  });

  it("reads a root, the Node that declares no type, only through identifyRoot", () => {
    const bytes = Buffer.from(node("Node"));
    const root = identifyRoot(bytes);
    assert.deepEqual(root, { id: sha256(bytes), name: "Node", frontmatter: { name: "Node" } });
    assert.ok(Object.isFrozen(root) && Object.isFrozen(root.frontmatter));
    assert.throws(() => identify(bytes), (e) => e instanceof FormError && /^untyped: Node declares no type; .* identifyRoot\(\)/.test(e.message), "identify() reads only ordinary Nodes");
    assert.throws(() => identifyRoot(Buffer.from(node("A", T))), (e) => e instanceof FormError && /not a root: A declares a type, Node/.test(e.message));
    assert.throws(() => identifyRoot(Buffer.from("---\ntitle: A\n---\n")), FormError);
    assert.ok(new Graph([root]).resolve({ name: "Node", id: root.id }) === root, "a root is held and resolved like any Node");
  });

  it("reads the Form strictly", () => {
    for (const bad of [
      "no frontmatter\n",
      "---\r\nname: A\r\n---\r\n",
      "---\nname: A\r\n---\n",
      "---\nname: A\n",
      "---\nname: A\n---",
      "---\n---\n",
      "---\n- A\n---\n",
      "---\nname: \"A \"\n---\n",
      "---\nname: \"A\\nB\"\n---\n",
      "---\nname: \"A\\rB\"\n---\n",
      "---\nname: \"A\\LB\"\n---\n",
      "---\nname: \"A\\NB\"\n---\n",
      "---\nname: A\ntype:\n  name: \"No\\rde\"\n  id: " + T.id + "\n---\n",
      "---\nname: [A]\n---\n",
      "---\ntitle: A\n---\n",
      "---\nname: A\nname: B\n---\n",
      "---\nname: A\ntype:\n  name: Node\n  id: XYZ\n---\n",
      "---\nname: A\ntype:\n  name: Node\n  id: " + T.id.toUpperCase() + "\n---\n",
      "---\nname: A\ntype:\n  name: Node\n  id: " + T.id + "\n  note: x\n---\n",
      "---\nname: A\ntype: Node\n---\n",
      "---\nname: A\nk: !foo v\n---\n",
      "---\nname: A\nk: !!binary aGk=\n---\n",
      "---\nname: A\nk: !!set {v}\n---\n",
      "---\nname: A\nk: !!timestamp 2001-12-14\n---\n",
      "---\nname: !!int 3\n---\n",
      "---\nname: A\nk: &a v\nl: *a\n---\n",
      "---\nname: A\nk: &a v\n---\n",
      "---\nname: A\nbase: {n: 1}\nm:\n  <<: {n: 2}\n---\n",
      "---\nname: A\n? [k]\n: v\n---\n",
      "---\nname: A\n3: v\n---\n",
      "---\nname: A\ntrue: v\n---\n",
    ])
      assert.throws(() => identify(Buffer.from(bad)), (e) => e instanceof FormError && e.name === "FormError" && /^not in Form/.test(e.message), bad);
    assert.throws(() => identify(Buffer.from([0x2d, 0x2d, 0x2d, 0x0a, 0xff, 0xfe])), (e) => e instanceof FormError && /^not UTF-8/.test(e.message));
  });

  it("reads reserved fields as written, whatever YAML would type them", () => {
    for (const id of ["1234e5678".padEnd(64, "0"), "1".repeat(64)]) {
      const n = identify(Buffer.from(`---\nname: 2024\ntype:\n  name: true\n  id: ${id}\n---\n`));
      assert.deepEqual([n.name, n.type], ["2024", { name: "true", id }]);
      assert.deepEqual([n.frontmatter.name, n.frontmatter.type], ["2024", { name: "true", id }]);
    }
    assert.equal(identifyRoot(Buffer.from("---\nname: !!str 0x1F\n---\n")).name, "0x1F");
    assert.equal(identifyRoot(Buffer.from("---\nname: null\n---\n")).name, "null");
    assert.deepEqual(identify(Buffer.from(`---\nname: A\ntype: !!map {name: !!str ${T.name}, id: ${T.id}}\n---\n`)).type, T);
    assert.throws(() => identify(Buffer.from(`---\nname: A\ntype: !!seq [${T.name}, ${T.id}]\n---\n`)), /not in Form/);
  });

  it("returns capability-owned frontmatter uninterpreted, typed by YAML 1.2 and frozen", () => {
    const n = identify(Buffer.from(`---\nname: A\ntype:\n  name: ${T.name}\n  id: ${T.id}\npriority: 3\nweight: 0.5\nenabled: true\nyes: no\nlabel: !!str 42\nowner:\nlist: !!seq [1, "1"]\n---\n`));
    assert.deepEqual(n.frontmatter, { name: "A", type: T, priority: 3, weight: 0.5, enabled: true, yes: "no", label: "42", owner: null, list: [1, "1"] });
    assert.ok(Object.isFrozen(n.frontmatter));
  });

  it("returns an identity frozen throughout, sequences and type included", () => {
    const n = identify(Buffer.from(`---\nname: A\ntype:\n  name: ${T.name}\n  id: ${T.id}\nlist: [1, [2, {k: [3]}]]\n---\n`));
    const frozen = (v) => typeof v !== "object" || v === null || (Object.isFrozen(v) && Object.values(v).every(frozen));
    assert.ok(frozen(n));
    assert.equal(n.type, n.frontmatter.type, "one type reference, frozen once");
    assert.throws(() => {
      n.name = "B";
    }, TypeError);
    assert.throws(() => n.frontmatter.list[1].push(4), TypeError);
    assert.throws(() => {
      n.type.id = "d".repeat(64);
    }, TypeError);
  });

  it("reads frontmatter keys in any order and any YAML spelling, while identity stays the exact bytes", () => {
    const block = identify(Buffer.from(node("A", T)));
    const flow = identify(Buffer.from(`---\ntype: {name: ${T.name}, id: ${T.id}}\nname: 'A'\n---\n\n# A\n`));
    assert.deepEqual([flow.name, flow.type], [block.name, block.type]);
    assert.notEqual(flow.id, block.id);
  });

  it("says which bytes claim to be a Node, and which names and ids are valid", () => {
    assert.deepEqual(["---\nname: A", "---\r\nname: A", "----\n", "--- \n", "# A\n", ""].map((t) => claimsForm(Buffer.from(t))), [true, true, false, false, false, false]);
    assert.deepEqual(["A", "A b", "2024"].map(isName), [true, true, true]);
    assert.deepEqual([" A", "A ", "", "A\nB", "A\rB", "A\vB", "A\fB", "A\u0085B", "A\u2028B", "A\u2029B", 3, undefined].map(isName), Array(12).fill(false));
    assert.deepEqual(["a".repeat(64), "A".repeat(64), "a".repeat(63), 7].map(isId), [true, false, false, false]);
  });

  it("refuses an Edge reference whose name no Node can have", () => {
    for (const name of ["A\rB", "A\u2028B"]) {
      const r = identify(Buffer.from(`---\nname: R\ntype:\n  name: ${T.name}\n  id: ${T.id}\nedges:\n  - type:\n      name: Serves\n      id: ${"b".repeat(64)}\n    targets:\n      - name: ${JSON.stringify(name)}\n        id: ${"a".repeat(64)}\n---\n`));
      assert.deepEqual(edgesOf(r), { edges: [], problems: ["edges[0].targets[0] has no valid name"] });
    }
  });
});

describe("reading frontmatter", () => {
  it("reads the frontmatter of any file in Form, a Node or not, and never the body", () => {
    const one = readFrontmatter(Buffer.from("---\ntype: Sample/Record\nchange: core/C5\ngated: true\nfiles: [a.md]\n---\n\n# One\n"));
    const two = readFrontmatter(Buffer.from("---\ntype: Sample/Record\nchange: core/C5\ngated: true\nfiles: [a.md]\n---\n\nanything: else\n"));
    assert.deepEqual(one, { type: "Sample/Record", change: "core/C5", gated: true, files: ["a.md"] });
    assert.deepEqual(two, one);
    assert.ok(Object.isFrozen(one) && Object.isFrozen(one.files));
  });

  it("refuses what the Form refuses, with a FormError", () => {
    for (const bad of ["# no frontmatter\n", "---\na: 1\n", "---\r\na: 1\r\n---\r\n", "---\n- a\n---\n", "---\na: &x 1\nb: *x\n---\n", "---\na: !!binary aGk=\n---\n", "---\na: 1\na: 2\n---\n"]) {
      assert.throws(() => readFrontmatter(Buffer.from(bad)), (e) => e instanceof FormError && /^not in Form/.test(e.message), bad);
    }
    assert.throws(() => readFrontmatter(Buffer.from([0x2d, 0x2d, 0x2d, 0x0a, 0xff])), (e) => e instanceof FormError && /^not UTF-8/.test(e.message));
  });

  it("is offered alone as @kaihacksai/kaal-graph/form, which imports no host module", () => {
    assert.equal(form.readFrontmatter, readFrontmatter);
    assert.equal(form.FormError, FormError);
    const source = readFileSync(join(SKILL, "scripts", "form.mjs"), "utf8");
    assert.deepEqual([...source.matchAll(/\bfrom\s+["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)|\bimport\s+["']([^"']+)["']/g)].map((m) => m[1] ?? m[2] ?? m[3]), ["yaml"]);
  });
});

describe("edges", () => {
  const serves = make("Serves");
  const a = make("A");
  const b = make("B");

  it("are grouped by type, one Edge per target, sorted", () => {
    const r = make("R", { groups: [{ type: ref(serves), targets: [ref(b), ref(a)] }] });
    const { edges, problems } = edgesOf(r);
    assert.deepEqual(problems, []);
    assert.deepEqual(edges, [ref(a), ref(b)].sort((x, y) => (x.id < y.id ? -1 : 1)).map((t) => ({ type: ref(serves), target: t })));
  });

  it("are none without an edges key", () => {
    assert.deepEqual(edgesOf(a), { edges: [], problems: [] });
  });

  const malformed = {
    "edges not a sequence": "edges: x\n",
    "empty edges": "edges: []\n",
    "group with an extra key": `edges:\n  - type: {name: Serves, id: ${"1".repeat(64)}}\n    targets: [{name: A, id: ${"2".repeat(64)}}]\n    note: x\n`,
    "group without targets": `edges:\n  - type: {name: Serves, id: ${"1".repeat(64)}}\n`,
    "empty targets": `edges:\n  - type: {name: Serves, id: ${"1".repeat(64)}}\n    targets: []\n`,
    "two types in one group": `edges:\n  - type: [{name: S, id: ${"1".repeat(64)}}, {name: T, id: ${"3".repeat(64)}}]\n    targets: [{name: A, id: ${"2".repeat(64)}}]\n`,
    "bad id": `edges:\n  - type: {name: Serves, id: XYZ}\n    targets: [{name: A, id: ${"2".repeat(64)}}]\n`,
    "target without a name": `edges:\n  - type: {name: Serves, id: ${"1".repeat(64)}}\n    targets: [{id: ${"2".repeat(64)}}]\n`,
    "duplicate target": `edges:\n  - type: {name: Serves, id: ${"1".repeat(64)}}\n    targets: [{name: A, id: ${"2".repeat(64)}}, {name: A, id: ${"2".repeat(64)}}]\n`,
    "repeated type group": `edges:\n  - type: {name: Serves, id: ${"1".repeat(64)}}\n    targets: [{name: A, id: ${"2".repeat(64)}}]\n  - type: {name: Serves, id: ${"1".repeat(64)}}\n    targets: [{name: B, id: ${"3".repeat(64)}}]\n`,
  };
  for (const [label, raw] of Object.entries(malformed)) {
    it(`are refused, never ignored: ${label}`, () => {
      const r = edgesOf(make("R", { raw }));
      assert.deepEqual(r.edges, []);
      assert.ok(r.problems.length > 0);
      assert.deepEqual(new Graph([make("R", { raw })]).check().length > 0, true);
    });
  }
});

describe("constructing a Node", () => {
  const A = { name: "A", id: "a".repeat(64) };
  const B = { name: "B", id: "b".repeat(64) };
  const serves = { name: "Serves", id: "1234e5678".padEnd(64, "0") };
  const refines = { name: "Refines", id: "1".repeat(64) };

  it("writes exact canonical bytes that read back as the Node given", () => {
    const { bytes, node } = createNode({ name: "R", type: f.definition, edges: [{ type: serves, targets: [A] }], frontmatter: { priority: 3 } });
    const q = JSON.stringify;
    assert.equal(
      bytes.toString(),
      `---\nname: "R"\ntype:\n  name: ${q(f.definition.name)}\n  id: ${q(f.definition.id)}\nedges:\n  - type:\n      name: "Serves"\n      id: ${q(serves.id)}\n    targets:\n      - name: "A"\n        id: ${q(A.id)}\npriority: 3\n---\n\n# R\n`,
    );
    assert.deepEqual(node, identify(bytes));
    assert.deepEqual([node.name, node.type, node.frontmatter.priority], ["R", f.definition, 3]);
    assert.deepEqual(edgesOf(node).edges, [{ type: serves, target: A }], "an id that YAML would read as a number stays the string given");
  });

  it("gives the same bytes and id whatever order groups, targets and keys are given in", () => {
    const one = createNode({ name: "R", type: f.definition, edges: [{ type: serves, targets: [B, A] }, { type: refines, targets: [A] }], frontmatter: { b: { y: 1, x: [2, "2"] }, a: true } });
    const two = createNode({ name: "R", type: f.definition, edges: [{ type: refines, targets: [A] }, { type: serves, targets: [A, B] }], frontmatter: { a: true, b: { x: [2, "2"], y: 1 } } });
    assert.ok(one.bytes.equals(two.bytes));
    assert.equal(one.node.id, two.node.id);
    assert.deepEqual(createNode({ name: "R", type: f.definition }).bytes, createNode({ name: "R", type: f.definition }).bytes);
  });

  it("builds Nodes a Graph relates, checks and traverses", () => {
    const a = createNode({ name: "A", type: f.definition }).node;
    const kind = createNode({ name: "Serves", type: f.definition }).node;
    const r = createNode({ name: "R", type: f.definition, edges: [{ type: ref(kind), targets: [ref(a)] }] }).node;
    const g = new Graph([a, kind, r]);
    assert.deepEqual(g.check(), []);
    assert.deepEqual(g.in(a.id), [{ type: ref(kind), source: ref(r) }]);
    assert.deepEqual([...g.traverse(r.id)].map((s) => s.id), [r.id, a.id]);
  });

  it("takes a body as given, or none", () => {
    const type = `type:\n  name: "${f.definition.name}"\n  id: "${f.definition.id}"\n`;
    assert.equal(createNode({ name: "A", type: f.definition, body: "Text.\n" }).bytes.toString(), `---\nname: "A"\n${type}---\n\nText.\n`);
    assert.equal(createNode({ name: "A", type: f.definition, body: "" }).bytes.toString(), `---\nname: "A"\n${type}---\n`);
  });

  it("constructs only ordinary Nodes: a Node with no type is refused, never written as a root", () => {
    assert.throws(() => createNode({ name: "A" }), (e) => e instanceof FormError && /A declares no type/.test(e.message));
  });

  it("refuses what would not be a Node in Form with well-formed Edges", () => {
    for (const spec of [
      { name: "A " },
      { name: "A\nB" },
      { name: "A", type: { name: "Node", id: "XYZ" } },
      { name: "A", edges: [{ type: serves, targets: [A, A] }] },
      { name: "A", edges: [{ type: serves, targets: [] }] },
      { name: "A", edges: [{ type: serves, targets: [A] }, { type: serves, targets: [B] }] },
      { name: "A", edges: [{ type: serves, targets: [{ name: "A\u2028B", id: A.id }] }] },
      { name: "A", frontmatter: { name: "B" } },
      { name: "A", frontmatter: { edges: [] } },
      { name: "A", frontmatter: { type: null } },
    ])
      assert.throws(() => createNode(spec), FormError, JSON.stringify(spec));
  });
});

describe("the graph", () => {
  const serves = make("Serves");
  const refines = make("Refines");
  const intent = make("Intent capture");
  const r1 = make("R1", { groups: [{ type: ref(serves), targets: [ref(intent)] }] });
  const r2 = make("R2", { groups: [{ type: ref(serves), targets: [ref(intent)] }, { type: ref(refines), targets: [ref(r1)] }] });

  it("navigates out and in, with no backlink in the target", () => {
    const g = new Graph([r2, intent, serves, r1, refines]);
    assert.deepEqual(g.check(), []);
    assert.deepEqual(g.out(r1.id), [{ type: ref(serves), target: ref(intent) }]);
    assert.deepEqual(new Set(g.in(intent.id).map((e) => e.source.id)), new Set([r1.id, r2.id]));
    assert.equal(intent.frontmatter.edges, undefined);
    assert.deepEqual(g.in(r1.id), [{ type: ref(refines), source: ref(r2) }]);
  });

  it("is the same whatever order Nodes are added in", () => {
    const nodes = [serves, refines, intent, r1, r2];
    const view = (g) => JSON.stringify(nodes.map((n) => [g.out(n.id), g.in(n.id), g.check()]));
    assert.equal(view(new Graph(nodes)), view(new Graph([...nodes].reverse())));
  });

  it("finds Nodes and Edges by exactly their type, whatever order Nodes are added in", () => {
    const requirement = make("Requirement");
    const goal = make("Goal");
    const a = make("A", { type: ref(requirement), groups: [{ type: ref(serves), targets: [ref(intent), ref(goal)] }] });
    const b = make("B", { type: ref(requirement), groups: [{ type: ref(serves), targets: [ref(intent)] }, { type: ref(refines), targets: [ref(a)] }] });
    const c = make("C", { type: ref(goal) });
    const nodes = [serves, refines, intent, requirement, goal, a, b, c];
    const sorted = (...ns) => ns.map(ref).sort((x, y) => (x.id < y.id ? -1 : 1));
    for (const g of [new Graph(nodes), new Graph([...nodes].reverse())]) {
      assert.deepEqual(g.typed(ref(requirement)), sorted(a, b));
      assert.deepEqual(g.typed(ref(goal)), [ref(c)]);
      assert.deepEqual(g.typed(f.definition).map((n) => n.name).sort(), ["Goal", "Intent capture", "Refines", "Requirement", "Serves"]);
      const servesEdges = [
        ...[ref(intent), ref(goal)].map((target) => ({ source: ref(a), target, type: ref(serves) })),
        { source: ref(b), target: ref(intent), type: ref(serves) },
      ].sort((x, y) => (x.source.id < y.source.id ? -1 : x.source.id > y.source.id ? 1 : x.target.id < y.target.id ? -1 : 1));
      assert.deepEqual(g.edges(ref(serves)), servesEdges);
      assert.deepEqual(g.edges(ref(refines)), [{ source: ref(b), target: ref(a), type: ref(refines) }]);
      assert.deepEqual(g.typed(ref(serves)), [], "a Node type and an Edge type are queried apart");
      assert.deepEqual(g.edges(ref(requirement)), []);
      assert.deepEqual(g.typed({ name: "Not Requirement", id: requirement.id }), [], "a misnamed reference matches no Node");
      assert.deepEqual(g.edges({ name: "Not Serves", id: serves.id }), [], "a misnamed reference matches no Edge");
      assert.deepEqual(g.typed({ name: "Requirement", id: "f".repeat(64) }), []);
    }
  });

  it("reads a numeric-looking id only when quoted", () => {
    const digits = { name: "Digits", id: "1".repeat(64) };
    const plain = identify(Buffer.from(`---\nname: R\ntype:\n  name: ${f.definition.name}\n  id: ${f.definition.id}\nedges:\n  - type:\n${yamlRef(ref(serves), "      ")}    targets:\n      - name: Digits\n        id: ${digits.id}\n---\n`));
    const quoted = identify(Buffer.from(`---\nname: R\ntype:\n  name: ${f.definition.name}\n  id: ${f.definition.id}\nedges:\n  - type:\n${yamlRef(ref(serves), "      ")}    targets:\n      - name: Digits\n        id: "${digits.id}"\n---\n`));
    assert.equal(edgesOf(plain).edges.length, 0);
    assert.equal(edgesOf(plain).problems.length, 1);
    assert.deepEqual(edgesOf(quoted).edges.map((e) => e.target), [digits]);
  });

  it("reports unresolved and misnamed references", () => {
    const ghost = { name: "Ghost", id: "f".repeat(64) };
    const misnamed = { name: "Not Intent", id: intent.id };
    const r = make("R", { groups: [{ type: ref(serves), targets: [ghost, misnamed] }] });
    const findings = new Graph([serves, intent, r]).check();
    assert.equal(findings.length, 2);
    assert.match(findings.join("\n"), /target Ghost .* resolves to no Node/);
    assert.match(findings.join("\n"), /target names Not Intent, but Node .* is named Intent capture/);
  });

  it("looks a Node up by name and by reference, the name checked", () => {
    const twin = make("R1", { raw: "note: another R1\n" });
    const twins = [r1, twin].map(ref).sort((a, b) => (a.id < b.id ? -1 : 1));
    for (const g of [new Graph([serves, intent, r1, twin]), new Graph([twin, r1, intent, serves])]) {
      assert.deepEqual(g.named("R1"), twins, "a name alone may name several Nodes, sorted by id");
      assert.deepEqual(g.named("R"), []);
      assert.equal(g.resolve(ref(r1)), r1);
      assert.equal(g.resolve(ref(twin)), twin);
      assert.equal(g.resolve({ name: "R2", id: r1.id }), undefined, "a misnamed reference resolves to nothing");
      assert.equal(g.resolve({ name: "R1", id: "f".repeat(64) }), undefined);
    }
  });

  it("answers every query with records the caller cannot use to change the graph", () => {
    const g = new Graph([serves, refines, intent, r1, r2]);
    const queries = [() => g.out(r2.id), () => g.in(intent.id), () => g.named(r1.name), () => g.typed(f.definition), () => g.edges(ref(serves))];
    const before = queries.map((q) => JSON.stringify(q()));
    for (const q of queries) {
      const list = q();
      assert.notEqual(list, q(), "each call returns a fresh array");
      for (const record of list) {
        assert.ok(Object.isFrozen(record));
        for (const v of Object.values(record)) if (typeof v === "object") assert.ok(Object.isFrozen(v));
        assert.throws(() => {
          record.id = "x";
        }, TypeError);
      }
      list.length = 0;
      list.push({ forged: true });
    }
    assert.deepEqual(queries.map((q) => JSON.stringify(q())), before);
    assert.deepEqual(g.check(), []);
    assert.deepEqual([...g.traverse(r2.id)].length, 3);
    for (const e of edgesOf(r2).edges) assert.ok(Object.isFrozen(e) && Object.isFrozen(e.type) && Object.isFrozen(e.target));
  });

  it("holds only Nodes that cannot change, so its indexes always agree with them", () => {
    const g = new Graph([serves, intent, r1]);
    const view = () => JSON.stringify([g.named("Intent capture"), g.resolve(ref(intent)) === intent, g.out(r1.id), g.in(intent.id), g.typed(f.definition), g.edges(ref(serves)), g.check()]);
    const before = view();
    assert.throws(() => {
      g.node(intent.id).name = "Renamed";
    }, TypeError);
    assert.throws(() => g.node(r1.id).frontmatter.edges[0].targets.push(ref(serves)), TypeError);
    assert.throws(() => {
      g.node(r1.id).type = ref(serves);
    }, TypeError);
    assert.equal(view(), before);
  });

  it("refuses a Node that could still change, adding nothing", () => {
    const g = new Graph([serves, intent]);
    const before = JSON.stringify([g.named("R1"), g.in(intent.id), g.check()]);
    const thawed = [
      ["an open Node", { ...r1 }],
      ["an open type", Object.freeze({ ...r1, type: { ...r1.type } })],
      ["open frontmatter", Object.freeze({ ...r1, frontmatter: { ...r1.frontmatter } })],
      ["an open sequence in the frontmatter", Object.freeze({ ...r1, frontmatter: Object.freeze({ ...r1.frontmatter, edges: [...r1.frontmatter.edges] }) })],
      ["frozen frontmatter that contains itself", (() => {
        const frontmatter = { ...r1.frontmatter };
        frontmatter.self = frontmatter;
        return Object.freeze({ ...r1, frontmatter: Object.freeze(frontmatter) });
      })()],
    ];
    for (const [label, node] of thawed) {
      assert.throws(() => g.add(node), (e) => e instanceof TypeError && /only frozen Nodes/.test(e.message), label);
      assert.throws(() => new Graph([node]), TypeError, label);
    }
    assert.equal(JSON.stringify([g.named("R1"), g.in(intent.id), g.check()]), before);
    const carried = Object.freeze({ ...r1, path: "elsewhere/R1.md", bytes: Buffer.from("not read") });
    g.add(carried);
    assert.equal(g.node(r1.id), carried, "a frozen Node may carry the caller's own fields, which Graph never reads");
    assert.deepEqual(g.in(intent.id), [{ type: ref(serves), source: ref(r1) }]);
  });

  it("answers queries with Edges as declared, which check() verifies", () => {
    const misnamed = { name: "Not Intent", id: intent.id };
    const ghost = { name: "Ghost", id: "f".repeat(64) };
    const r = make("R", { groups: [{ type: ref(serves), targets: [ghost, misnamed] }] });
    const g = new Graph([serves, intent, r]);
    assert.deepEqual(g.out(r.id).map((e) => e.target), [ghost, misnamed].sort((x, y) => (x.id < y.id ? -1 : 1)));
    assert.deepEqual(g.in(intent.id), [{ type: ref(serves), source: ref(r) }], "a misnamed Edge is still declared into its target's id");
    assert.deepEqual(g.edges(ref(serves)).map((e) => e.target.name).sort(), ["Ghost", "Not Intent"]);
    assert.deepEqual([...g.traverse(r.id)].map((s) => s.id), [r.id, intent.id], "traversal follows the id, and skips a Node not present");
    assert.equal(g.check().length, 2, "check() reports both references the queries returned as declared");
  });

  it("keeps an old Edge on the old meaning when the defining Node is revised", () => {
    const servesV2 = make("Serves", { raw: "note: revised meaning\n" });
    assert.notEqual(servesV2.id, serves.id);
    const g = new Graph([serves, servesV2, intent, r1]);
    assert.deepEqual(g.out(r1.id)[0].type, ref(serves));
    assert.deepEqual(g.check(), []);
  });

  it("gives a Node a new identity when its Edge changes, and leaves the target unchanged", () => {
    const other = make("Other");
    const changed = make("R1", { groups: [{ type: ref(serves), targets: [ref(other)] }] });
    assert.notEqual(changed.id, r1.id);
    assert.equal(make("Intent capture").id, intent.id);
  });

  it("traverses breadth-first, once per Node, in either direction and by type", () => {
    const g = new Graph([serves, refines, intent, r1, r2]);
    const walk = [...g.traverse(r2.id)];
    assert.deepEqual(walk[0], { id: r2.id, depth: 0 });
    assert.deepEqual(new Set(walk.slice(1).map((s) => `${g.node(s.id).name}@${s.depth}`)), new Set(["R1@1", "Intent capture@1"]));
    assert.deepEqual(walk.slice(1).map((s) => s.id), g.out(r2.id).map((e) => e.target.id).filter((id, i, all) => all.indexOf(id) === i));
    assert.deepEqual(new Set([...g.traverse(intent.id, { direction: "in" })].map((s) => s.id)), new Set([intent.id, r1.id, r2.id]));
    assert.deepEqual([...g.traverse(r2.id, { type: refines.id })].map((s) => s.id), [r2.id, r1.id]);
  });

  it("builds and traverses a long chain of Edges", () => {
    const kind = make("Next");
    const nodes = [kind];
    let prev = make("Link 0");
    nodes.push(prev);
    const n = 2000;
    for (let i = 1; i < n; i++) {
      prev = make(`Link ${i}`, { groups: [{ type: ref(kind), targets: [ref(prev)] }] });
      nodes.push(prev);
    }
    const g = new Graph(nodes);
    assert.deepEqual(g.check(), []);
    const walk = [...g.traverse(prev.id)];
    assert.equal(walk.length, n);
    assert.deepEqual(walk.at(-1), { id: nodes[1].id, depth: n - 1 });
  });
});

describe("the package", () => {
  it("delivers KNIFE in Form, typed by a KAAL Definition", () => {
    const node = identify(readFileSync(join(PACKAGE, "payload", "KNIFE.md")));
    assert.equal(node.name, "KNIFE");
    assert.equal(node.type.name, "KAAL Definition");
  });

  it("checks and navigates Nodes on disk", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-graph-cli-"));
    const serves = bytes("Serves");
    const intent = bytes("Intent capture");
    const req = bytes("R", { groups: [{ type: { name: "Serves", id: sha256(serves) }, targets: [{ name: "Intent capture", id: sha256(intent) }] }] });
    mkdirSync(join(dir, "n"));
    const root = Buffer.from("---\nname: Root\n---\n");
    for (const [p, b] of [["n/serves.md", serves], ["n/intent.md", intent], ["n/r.md", req], ["n/root.md", root], ["notes.md", Buffer.from("# prose\n")]]) writeFileSync(join(dir, p), b);
    const run = (...args) => execute(process.execPath, [SCRIPT, ...args], { cwd: dir });
    assert.equal((await run("check", dir)).status, 0);
    assert.equal((await run("in", sha256(intent), dir)).stdout, `Serves\t${sha256(serves)}\tR\t${sha256(req)}\n`);
    const intentLine = `${sha256(intent)}\tIntent capture\t${f.definition.name} ${f.definition.id}\n`;
    assert.equal((await run("named", "Intent capture", dir)).stdout, intentLine);
    assert.equal((await run("resolve", "Intent capture", sha256(intent), dir)).stdout, intentLine);
    const misnamed = await run("resolve", "Serves", sha256(intent), dir);
    assert.deepEqual([misnamed.status, misnamed.stderr], [2, `Node ${sha256(intent)} is named Intent capture, not Serves\n`]);
    assert.equal((await run("named", "Nobody", dir)).status, 2);
    assert.equal((await run("named", "Root", dir)).stdout, `${sha256(root)}\tRoot\t-\n`, "a Node that declares no type is read as a root");
    writeFileSync(join(dir, "n/intent.md"), bytes("Intent capture", { raw: "note: changed\n" }));
    const broken = await run("check", dir);
    assert.equal(broken.status, 1);
    assert.match(broken.stdout, /resolves to no Node/);
    assert.equal((await run("bogus")).status, 2);
  });
});
