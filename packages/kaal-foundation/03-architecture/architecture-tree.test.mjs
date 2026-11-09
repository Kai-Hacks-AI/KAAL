/*---
tests: [foundation/F38, foundation/F39, foundation/F40, foundation/F41, foundation/F42, foundation/F43, foundation/N23]
---*/
// foundation/C21 planned publisher cases: the Solution / Delivery tree (00-changes/architecture-tree/*.md). Immutable to DO
// and CHECK; the DO moves this file unchanged to a delivery/ folder beside the Architecture Node and turns it GREEN.
// It reads the repository and the generated dist/: run `npm run build` first. No platform is consulted and no shell
// is chosen (foundation/N7).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARCH = readFileSync(join(PACKAGE, "03-architecture", "architecture.md"), "utf8");
const scratch = mkdtempSync(join(tmpdir(), "foundation-tree-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

/** Every file under `dir` (relative POSIX paths), skipping dependencies and generated output. */
const files = (dir, rel = "") => {
  const out = [];
  for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(e.name)) continue;
    const next = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...files(dir, next));
    else out.push(next);
  }
  return out.sort();
};
/** The text of one `## <Heading>` section, or null. */
const section = (heading) => {
  const m = ARCH.match(new RegExp(`^## ${heading}\\s*$`, "m"));
  if (!m) return null;
  const rest = ARCH.slice(m.index + m[0].length);
  const next = rest.search(/^## /m);
  return next < 0 ? rest : rest.slice(0, next);
};
const elements = (text) => [...text.matchAll(/^- \*\*foundation\/(A\d+)\*\*/gm)].map((m) => m[1]);
const CASE_FILES = () => files(PACKAGE).filter((f) => /\.test\.(mjs|ts)$/.test(f) && !f.startsWith("00-changes/"));

test("foundation/T64 [foundation/F38]: Architecture has the branches Solution and Delivery, and every element is defined under exactly one", () => {
  const solution = section("Solution");
  const delivery = section("Delivery");
  assert.ok(solution !== null && delivery !== null, "03-architecture/architecture.md has no '## Solution' and '## Delivery' branches");
  const all = [...ARCH.matchAll(/^- \*\*foundation\/(A\d+)\*\*/gm)].map((m) => m[1]);
  const placed = [...elements(solution), ...elements(delivery)];
  assert.deepEqual([...placed].sort(), [...all].sort(), "every element sits in a branch, none in two and none twice");
  assert.equal(new Set(placed).size, placed.length);
});

test("foundation/T65 [foundation/F39, foundation/N23]: every Case has an id and targets, a Case's branch is its Architecture element's or its targets' single branch, and a Case on a cross-cutting target names the element it verifies", () => {
  const untitled = [];
  const cases = [];
  for (const f of CASE_FILES()) {
    const text = readFileSync(join(PACKAGE, f), "utf8");
    const calls = [...text.matchAll(/(?:^|\s)(?:test|it)\(\s*(["`])([^"`]*)\1/g)].map((m) => m[2]);
    for (const title of calls) {
      const m = title.match(/^(foundation\/T[\w-]+) \[([^\]]+)\]: /);
      if (m) cases.push({ id: m[1], file: f, targets: m[2].split(",").map((t) => t.trim()) });
      else untitled.push(`${f}: ${title.slice(0, 60)}`);
    }
  }
  assert.deepEqual(untitled, [], "every Case is titled foundation/T<n> [<targets>]: <what it checks>");
  const solution = section("Solution");
  const delivery = section("Delivery");
  assert.ok(solution !== null && delivery !== null, "the tree does not exist");
  const answered = (text, target) => new RegExp(`\\[[^\\]]*${target.replace("/", "\\/")}\\b[^\\]]*\\]`).test(text);
  const elementOf = (target) => /^foundation\/A\d+$/.test(target);
  const orphans = [];
  const unplaced = [];
  for (const c of cases) {
    const named = c.targets.filter(elementOf);
    const branches = new Set();
    if (named.length > 0) {
      for (const e of named) {
        const id = e.split("/")[1];
        if (elements(solution).includes(id)) branches.add("S");
        else if (elements(delivery).includes(id)) branches.add("D");
        else orphans.push(`${c.id}:${e}`);
      }
    } else {
      for (const t of c.targets) {
        const s = answered(solution, t), d = answered(delivery, t);
        if (!s && !d) orphans.push(`${c.id}:${t}`);
        else branches.add(s && d ? "both" : s ? "S" : "D");
      }
    }
    if (branches.size !== 1 || branches.has("both")) unplaced.push(c.id);
  }
  assert.deepEqual(orphans, [], "every target is an element or is answered by one");
  assert.deepEqual(unplaced, [], "a Case is in one branch: name the Architecture element it verifies, or split it");
});

test("foundation/T66 [foundation/F40]: no 04-test check folder holds a Case", () => {
  const holders = files(join(PACKAGE, "04-test")).filter((f) => !f.includes("/plan/") && /\.test\.(mjs|ts)$/.test(f) && /\btest\(/.test(readFileSync(join(PACKAGE, "04-test", f), "utf8")));
  assert.deepEqual(holders, [], "Cases sit beside the Node that motivated them; the suites only collect");
});

test("foundation/T67 [foundation/F41]: the build ships only the Case files the computed graph marks as shipping, and refuses a graph that is not the Case files on disk", () => {
  const copy = join(scratch, "package");
  const tooling = join(copy, "04-test", "engineering-check");
  mkdirSync(tooling, { recursive: true });
  for (const f of ["build.mjs", "cases.mjs"]) cpSync(join(PACKAGE, "04-test", "engineering-check", f), join(tooling, f));
  mkdirSync(join(copy, "02-requirements", "functional"), { recursive: true });
  writeFileSync(join(copy, "02-requirements", "functional", "requirements.md"), "x\n");
  writeFileSync(join(copy, "02-requirements", "functional", "ships.test.mjs"), "x\n");
  writeFileSync(join(copy, "02-requirements", "functional", "stays.test.mjs"), "x\n");
  const graph = { files: { "02-requirements/functional/ships.test.mjs": { ships: true, runs: "shipped", cases: ["foundation/T1"] }, "02-requirements/functional/stays.test.mjs": { ships: false, runs: "collector", cases: ["foundation/T2"] } } };
  writeFileSync(join(tooling, "cases.json"), JSON.stringify(graph));
  const run = () => spawnSync(process.execPath, [join(tooling, "build.mjs")], { encoding: "utf8" });
  const r = run();
  assert.equal(r.status, 0, r.stderr);
  const out = join(copy, "dist", "docs", "requirements", "functional");
  assert.ok(existsSync(join(out, "requirements.md")), "a Node ships");
  assert.ok(existsSync(join(out, "ships.test.mjs")), "a Case file the graph marks as shipping ships");
  assert.ok(!existsSync(join(out, "stays.test.mjs")), "a Case file the graph does not mark as shipping never ships");
  writeFileSync(join(copy, "02-requirements", "functional", "unlisted.test.mjs"), "x\n");
  const bad = run();
  assert.notEqual(bad.status, 0, "a Case file on disk that the graph does not list stops the build");
  assert.match(bad.stderr, /unlisted\.test\.mjs/);
});

test("foundation/T68 [foundation/F42]: the engineering suite is collected from the computed graph, not a hand-kept list, and fails closed when the graph is not the Case files", () => {
  const scripts = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).scripts;
  assert.doesNotMatch(scripts["test:publisher"], /\.test\.mjs/, "test:publisher names test files by hand");
  const copy = join(scratch, "collector");
  const tooling = join(copy, "04-test", "engineering-check");
  mkdirSync(tooling, { recursive: true });
  for (const f of ["collect.mjs", "cases.mjs"]) cpSync(join(PACKAGE, "04-test", "engineering-check", f), join(tooling, f));
  writeFileSync(join(copy, "a.test.mjs"), 'import { test } from "node:test";\ntest("foundation/T1 [foundation/F1]: a", () => {});\n');
  writeFileSync(join(tooling, "cases.json"), JSON.stringify({ files: {} }));
  const r = spawnSync(process.execPath, [join(tooling, "collect.mjs")], { encoding: "utf8" });
  assert.notEqual(r.status, 0, "a Case file the graph does not list stops the collector");
  assert.match(r.stderr, /a\.test\.mjs/);
  writeFileSync(join(tooling, "cases.json"), JSON.stringify({ files: { "a.test.mjs": { ships: false, runs: "collector", cases: ["foundation/T1"] } } }));
  const ok = spawnSync(process.execPath, [join(tooling, "collect.mjs")], { encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  assert.equal(ok.status, 0, `${ok.stdout}${ok.stderr}`);
  assert.match(ok.stdout, /foundation\/T1/, "the collector ran the listed Case once");
});

test("foundation/T69 [foundation/N23]: the Cross-cutting section lists exactly the Requirements and Intents that leaves in both branches answer, each with a reason, and no shipped file comes from a delivery folder", () => {
  const cross = section("Cross-cutting");
  assert.ok(cross !== null, "03-architecture/architecture.md has no '## Cross-cutting' section");
  const listed = [...cross.matchAll(/^- \*\*(foundation\/[FNI]\d+)\*\*[^\n]*?:\s*(\S[^\n]*)$/gm)];
  assert.ok(listed.length > 0 && listed.every((m) => m[2].length > 10), "each listed Requirement states why both branches answer it");
  const solution = section("Solution") ?? "";
  const delivery = section("Delivery") ?? "";
  const answered = (text, id) => new RegExp(`\\[[^\\]]*${id.replace("/", "\\/")}\\b[^\\]]*\\]`).test(text);
  for (const [, id] of listed) assert.ok(answered(solution, id) && answered(delivery, id), `${id} is listed but is not answered in both branches`);
  const manifest = JSON.parse(readFileSync(join(PACKAGE, "04-test", "package-check", "verify.json"), "utf8"));
  assert.ok(!Object.keys(manifest.files).some((f) => f.includes("/delivery/")), "no file from a delivery folder is shipped");
});

test("foundation/T70 [foundation/F43]: every Case file carries a YAML front matter with a tests edge, and each edge names an element that exists in a Node", () => {
  const nodes = ["01-intent", "02-requirements", "03-architecture", "06-defects"].flatMap((d) =>
    files(PACKAGE).filter((f) => f.startsWith(`${d}/`) && f.endsWith(".md") && !f.includes("/delivery/")).map((f) => readFileSync(join(PACKAGE, f), "utf8")));
  const known = new Set(nodes.flatMap((t) => [...t.matchAll(/\*\*foundation\/([IFNAD]\d+)\*\*/g)].map((m) => m[1])));
  const bad = [];
  for (const f of CASE_FILES()) {
    const m = readFileSync(join(PACKAGE, f), "utf8").match(/^(?:\/\*)?---\r?\n([\s\S]*?)\r?\n---/);
    const edge = m && m[1].match(/^tests:\s*\[([^\]]*)\]\s*$/m);
    const ids = edge ? edge[1].split(",").map((s) => s.trim().replace(/^foundation\//, "")).filter(Boolean) : [];
    if (ids.length === 0 || !ids.every((id) => known.has(id))) bad.push(f);
  }
  assert.deepEqual(bad, [], "Case files without a resolvable tests edge");
});
