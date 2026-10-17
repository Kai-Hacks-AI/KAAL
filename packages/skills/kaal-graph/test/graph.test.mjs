import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, readContribution, register, sha256 } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { execute, read } from "kaal-hosting";
import { edgesOf, Graph } from "kaal-graph";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = join(PACKAGE, "skills", "kaal-graph");
const SCRIPT = join(SKILL, "scripts", "graph.mjs");
const f = foundation();

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
  it("has a Skill Node admitted by Core alone", async () => {
    const node = identify(readFileSync(join(PACKAGE, "payload", "Graph.md")));
    assert.deepEqual([node.name, node.type], ["Graph", f.skill]);
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-graph-")), "engine");
    await bootstrap(engine);
    await register(engine, "skill", "kaal-graph", await readContribution(join(PACKAGE, "payload")));
    assert.deepEqual((await capabilities(engine)).skills, [{ name: "Graph", id: node.id }]);
  });

  it("has an Agent Skill that conforms", async () => {
    assert.deepEqual(checkSkill("kaal-graph", await read(SKILL)), { standard: [], kaal: [], warnings: [] });
  });

  it("checks and navigates Nodes on disk", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-graph-cli-"));
    const serves = bytes("Serves");
    const intent = bytes("Intent capture");
    const req = bytes("R", { groups: [{ type: { name: "Serves", id: sha256(serves) }, targets: [{ name: "Intent capture", id: sha256(intent) }] }] });
    mkdirSync(join(dir, "n"));
    for (const [p, b] of [["n/serves.md", serves], ["n/intent.md", intent], ["n/r.md", req], ["notes.md", Buffer.from("# prose\n")]]) writeFileSync(join(dir, p), b);
    const run = (...args) => execute(process.execPath, [SCRIPT, ...args], { cwd: dir });
    assert.equal((await run("check", dir)).status, 0);
    assert.equal((await run("in", sha256(intent), dir)).stdout, `Serves\t${sha256(serves)}\tR\t${sha256(req)}\n`);
    writeFileSync(join(dir, "n/intent.md"), bytes("Intent capture", { raw: "note: changed\n" }));
    const broken = await run("check", dir);
    assert.equal(broken.status, 1);
    assert.match(broken.stdout, /resolves to no Node/);
    assert.equal((await run("bogus")).status, 2);
  });
});
