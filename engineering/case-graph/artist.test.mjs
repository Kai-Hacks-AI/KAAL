// ARTIST (engineering/case-graph/PLAN.md): Engineering Cases on fixtures. No live capability is read; the conformance Case runs the
// computer on a fixture shaped like Foundation 0.0.2. Ids follow the PLAN's requirements.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Refusal, compute, untraced } from "./graph.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, "compute.mjs");
const GRAPH = "04-test/engineering-check/cases.json";

const ARCHITECTURE = `# Architecture

## Solution
- **demo/A1** [demo/F1, demo/I1]: **The library.**
- **demo/A3** [demo/F3, demo/I3]: **Another solution element.**

## Delivery
- **demo/A2** [demo/F2, demo/F1, demo/I2]: **Outer checks and the build.**

## Cross-cutting
- **demo/F1** [demo/I1]: answered by the library and checked from outside.
`;
const INTENT = "- **demo/I1** One.\n- **demo/I2** Two.\n- **demo/I3** Three.\n";
const REQUIREMENTS = "- **demo/F1** [demo/I1]: one.\n- **demo/F2** [demo/I2]: two.\n- **demo/F3** [demo/I3]: three.\n";
const front = (tests, extra = "") => `/*---\ntests: [${tests.join(", ")}]\n${extra}---*/\n`;
const caseFile = (cases, extra = "") =>
  front([...new Set(cases.flatMap(([, targets]) => targets))], extra) +
  cases.map(([id, targets]) => `test("demo/${id} [${targets.join(", ")}]: x", () => {});`).join("\n") + "\n";

/** A fixture package. Files not given keep the default. */
function fixture(files = {}) {
  const root = mkdtempSync(join(tmpdir(), "artist-"));
  const all = {
    "01-intent/intent.md": INTENT,
    "02-requirements/requirements.md": REQUIREMENTS,
    "03-architecture/architecture.md": ARCHITECTURE,
    "02-requirements/lib.test.mjs": caseFile([["T1", ["demo/A1", "demo/F1"]]]),
    "02-requirements/build.test.mjs": caseFile([["T2", ["demo/A2", "demo/F2"]]]),
    ...files,
  };
  for (const [path, text] of Object.entries(all)) {
    if (text === null) continue;
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}
const cli = (root, ...args) => spawnSync(process.execPath, [CLI, "--package", root, ...args], { encoding: "utf8" });
const refusal = (files) => assert.throws(() => compute(fixture(files)), Refusal);

test("T1 [R1, R2, R3]: the computer reads Architecture and the Case files and computes each Case's branch, ships and runs", () => {
  const root = fixture({ "03-architecture/plan.test.mjs": caseFile([["T3", ["demo/A2", "demo/F2"]]], "runs: external\n") });
  const graph = compute(root);
  assert.deepEqual(graph.cases.map((c) => [c.id, c.branch, c.ships]), [
    ["demo/T2", "delivery", false],
    ["demo/T1", "solution", true],
    ["demo/T3", "delivery", false],
  ]);
  assert.deepEqual(graph.files["02-requirements/lib.test.mjs"], { ships: true, runs: "shipped", cases: ["demo/T1"] });
  assert.deepEqual(graph.files["02-requirements/build.test.mjs"], { ships: false, runs: "collector", cases: ["demo/T2"] });
  assert.equal(graph.files["03-architecture/plan.test.mjs"].runs, "external");
  const printed = cli(root);
  assert.equal(printed.status, 0);
  assert.deepEqual(JSON.parse(printed.stdout), graph);
  assert.equal(cli(root).stdout, printed.stdout, "deterministic");
});

test("T2 [R3, R4]: a Case that names one Architecture element takes that element's branch, also for a cross-cutting Requirement; a Case that names none and has a cross-cutting target is refused", () => {
  const graph = compute(
    fixture({
      "02-requirements/x.test.mjs": caseFile([["T3", ["demo/A1", "demo/F1"]]]),
      "02-requirements/y.test.mjs": caseFile([["T4", ["demo/A2", "demo/F1"]]]),
    }),
  );
  assert.equal(graph.cases.find((c) => c.id === "demo/T3").branch, "solution");
  assert.equal(graph.cases.find((c) => c.id === "demo/T4").branch, "delivery");
  refusal({ "02-requirements/z.test.mjs": caseFile([["T5", ["demo/F1"]]]) });
});

test("T3 [R4]: the computer refuses what it cannot place, and writes nothing", () => {
  const bad = (name, files) => {
    const root = fixture(files);
    assert.throws(() => compute(root), Refusal, name);
    const run = cli(root, "--write");
    assert.equal(run.status, 2, name);
    assert.throws(() => readFileSync(join(root, GRAPH)), undefined, `${name}: nothing written`);
  };
  bad("no front matter", { "02-requirements/n.test.mjs": 'test("demo/T9 [demo/F1]: x", () => {});\n' });
  bad("invalid YAML", { "02-requirements/n.test.mjs": '/*---\ntests: [\n---*/\ntest("demo/T9 [demo/F1]: x", () => {});\n' });
  bad("a ships key", { "02-requirements/n.test.mjs": front(["demo/F3"], "ships: true\n") + 'test("demo/T9 [demo/F3]: x", () => {});\n' });
  bad("tests is not the union of the titles", { "02-requirements/n.test.mjs": front(["demo/F3", "demo/F2"]) + 'test("demo/T9 [demo/F3]: x", () => {});\n' });
  bad("an edge to no Node", { "02-requirements/n.test.mjs": caseFile([["T9", ["demo/F99"]]]) });
  bad("a target answered by no element", { "01-intent/intent.md": INTENT + "- **demo/I4** Four.\n", "02-requirements/n.test.mjs": caseFile([["T9", ["demo/I4"]]]) });
  bad("a duplicate Case id", { "02-requirements/n.test.mjs": caseFile([["T1", ["demo/F3"]]]) });
  bad("a title without an id and targets", { "02-requirements/n.test.mjs": front(["demo/F3"]) + 'test("does a thing", () => {});\n' });
  bad("a generated title", { "02-requirements/n.test.mjs": front(["demo/F3"]) + 'for (const n of [1]) test(`demo/T9 [demo/F3]: ${n}`, () => {});\n' });
  bad("an unrecognized multiline call", { "02-requirements/n.test.mjs": front(["demo/F3"]) + 'test("demo/T9 [demo/F3]: x", () => {});\ntest(\n  name,\n  () => {},\n);\n' });
  bad("an aliased test", { "02-requirements/n.test.mjs": front(["demo/F3"]) + 'import { test as check } from "node:test";\ncheck("demo/T9 [demo/F3]: x", () => {});\n' });
  bad("a test assigned to another name", { "02-requirements/n.test.mjs": front(["demo/F3"]) + 'const run = test;\ntest("demo/T9 [demo/F3]: x", () => {});\n' });
  bad("a cross-cutting target and no element", { "02-requirements/n.test.mjs": caseFile([["T9", ["demo/F1"]]]) });
  bad("elements of both branches", { "02-requirements/n.test.mjs": caseFile([["T9", ["demo/A1", "demo/A2"]]]) });
  bad("a file whose Cases are of both branches", { "02-requirements/n.test.mjs": caseFile([["T9", ["demo/A1"]], ["T8", ["demo/A2"]]]) });
  bad("a target the named element's branch does not answer", { "02-requirements/n.test.mjs": caseFile([["T9", ["demo/A1", "demo/F2"]]]) });
  bad("a Case file that cannot be read", { "02-requirements/n.test.mjs": "\u0000" });
});

test("T9 [R2, R4]: a Case declared across lines is enumerated, test.skip counts, a method named test does not, and a second Case missing from tests is refused", () => {
  const body = 'import { test } from "node:test";\ntest(\n  "demo/T3 [demo/A3, demo/F3]: multiline",\n  () => {},\n);\ntest.skip("demo/T4 [demo/A3]: skipped", () => {});\nconst ok = /x/.test("x");\n';
  const graph = compute(fixture({ "05-src/m.test.mjs": front(["demo/A3", "demo/F3"]) + body }));
  assert.deepEqual(graph.files["05-src/m.test.mjs"].cases, ["demo/T3", "demo/T4"]);
  const hidden = 'test("demo/T3 [demo/F3]: one", () => {});\ntest(\n  "demo/T5 [demo/A3]: two",\n  () => {},\n);\n';
  refusal({ "05-src/m.test.mjs": front(["demo/F3"]) + hidden });
});

test("T4 [R5]: an outer check of a shipped part names the Delivery element, so it is Delivery and does not ship", () => {
  const graph = compute(fixture({ "02-requirements/outer.test.mjs": caseFile([["T3", ["demo/A2", "demo/F1"]]]) }));
  const outer = graph.cases.find((c) => c.id === "demo/T3");
  assert.deepEqual([outer.branch, outer.ships], ["delivery", false]);
  assert.equal(graph.files["02-requirements/outer.test.mjs"].runs, "collector");
});

test("T5 [R7]: --check recomputes the content: a wrong branch, a changed tests edge under the same file name, a missing or an extra file all fail it", () => {
  const root = fixture();
  assert.equal(cli(root, "--write").status, 0);
  assert.equal(cli(root, "--check").status, 0);
  const path = join(root, GRAPH);
  const good = readFileSync(path, "utf8");
  const stale = (name, edit) => {
    writeFileSync(path, JSON.stringify(edit(JSON.parse(good)), null, 2) + "\n");
    assert.equal(cli(root, "--check").status, 1, name);
    writeFileSync(path, good);
  };
  stale("a wrong-branch graph", (g) => ((g.cases[0].branch = "solution"), (g.cases[0].ships = true), g));
  stale("a changed tests edge, same file names", (g) => ((g.cases[0].targets = ["demo/F3"]), g));
  stale("a Case dropped", (g) => (g.cases.pop(), g));
  stale("a shipping flag flipped", (g) => ((g.files[Object.keys(g.files)[0]].ships = true), g));
  assert.equal(cli(root, "--check").status, 0, "restored");
  writeFileSync(join(root, "02-requirements/extra.test.mjs"), caseFile([["T7", ["demo/A3", "demo/F3"]]]));
  assert.equal(cli(root, "--check").status, 1, "an extra Case file makes it stale");
  unlinkSync(join(root, "02-requirements/extra.test.mjs"));
  unlinkSync(path);
  assert.equal(cli(root, "--check").status, 1, "a missing graph is stale");
});

test("T6 [R8]: the computer reads with parsers and imports only yaml, commonmark, typescript and Node's built-ins, and no package imports it", () => {
  const allowed = new Set(["yaml", "commonmark", "typescript", "./graph.mjs", "../parsers/front-matter.mjs"]);
  for (const file of ["case-graph/graph.mjs", "case-graph/compute.mjs", "parsers/front-matter.mjs"]) {
    const imports = [...readFileSync(join(HERE, "..", file), "utf8").matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]);
    for (const spec of imports) assert.ok(spec.startsWith("node:") || allowed.has(spec), `${file}: ${spec}`);
  }
  for (const file of ["case-graph/graph.mjs", "parsers/front-matter.mjs"]) {
    assert.doesNotMatch(readFileSync(join(HERE, "..", file), "utf8"), /\.(?:match|matchAll)\(|RegExp\(|\.split\(["'`]\\n/, `${file} reads no source by pattern`);
  }
});

test("T7 [R9]: untraced Intents, Requirements, Defects and Nodes no Case answers are reported as observations, and change no exit code", () => {
  const root = fixture({
    "01-intent/intent.md": INTENT + "- **demo/I4** Four, no Requirement.\n",
    "02-requirements/requirements.md": REQUIREMENTS + "- **demo/F4** [demo/I3]: no element.\n",
    "02-requirements/defects.md": "- **demo/D1** [demo/A1]: found against the library.\n- **demo/D2** []: found against nothing.\n",
  });
  const gaps = untraced(root, compute(root));
  assert.deepEqual(gaps.intents, ["demo/I4"]);
  assert.deepEqual(gaps.requirements, ["demo/F4"]);
  assert.deepEqual(gaps.defects, ["demo/D2"]);
  assert.ok(gaps.uncovered.includes("demo/I4") && gaps.uncovered.includes("demo/F4") && gaps.uncovered.includes("demo/D1"));
  assert.ok(!gaps.uncovered.includes("demo/F1"), "a Case on A1 answers the Requirement the element answers");
  const run = cli(root, "--write");
  assert.equal(run.status, 0);
  assert.match(run.stderr, /traceability gap, intents: demo\/I4/);
});

test("T8 [R3, R6, R7]: conformance on a fixture shaped like Foundation 0.0.2: the shipped Cases are exactly the Solution Cases and the file set is the Case files", () => {
  const root = fixture({
    "05-src/skill.test.mjs": caseFile([["T10", ["demo/A3", "demo/F3"]]]),
    "02-requirements/ci.test.mjs": caseFile([["T11", ["demo/A2", "demo/F1"]], ["T12", ["demo/A2", "demo/F2"]]]),
    "00-changes/old/old.test.mjs": "not a Case of the package\n",
    "node_modules/x/x.test.mjs": "ignored\n",
  });
  const graph = compute(root);
  assert.deepEqual(graph.cases.filter((c) => c.ships).map((c) => c.id).sort(), ["demo/T1", "demo/T10"]);
  assert.deepEqual(Object.keys(graph.files), ["02-requirements/build.test.mjs", "02-requirements/ci.test.mjs", "02-requirements/lib.test.mjs", "05-src/skill.test.mjs"]);
});
