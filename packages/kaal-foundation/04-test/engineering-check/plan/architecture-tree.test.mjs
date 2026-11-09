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

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
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

test("foundation/T65 [foundation/F39, foundation/N23]: every Case has an id and targets, and a Case that verifies leaves in both branches either targets a listed cross-cutting Requirement or is refused as unsplit", () => {
  const untitled = [];
  const cases = [];
  for (const f of CASE_FILES()) {
    const text = readFileSync(join(PACKAGE, f), "utf8");
    const calls = [...text.matchAll(/(?:^|\s)(?:test|it)\(\s*(["`])([^"`]*)\1/g)].map((m) => m[2]);
    for (const title of calls) {
      const m = title.match(/^(foundation\/T\d+) \[([^\]]+)\]: /);
      if (m) cases.push({ id: m[1], file: f, targets: m[2].split(",").map((t) => t.trim()) });
      else untitled.push(`${f}: ${title.slice(0, 60)}`);
    }
  }
  assert.deepEqual(untitled, [], "every Case is titled foundation/T<n> [<targets>]: <what it checks>");
  const solution = section("Solution");
  const delivery = section("Delivery");
  const cross = section("Cross-cutting");
  assert.ok(solution !== null && delivery !== null && cross !== null, "the tree and its Cross-cutting section do not exist");
  const answered = (text, target) => new RegExp(`\\[[^\\]]*${target.replace("/", "\\/")}\\b[^\\]]*\\]`).test(text);
  const orphans = [];
  const unsplit = [];
  for (const c of cases) {
    const per = c.targets.map((t) => ({ t, s: answered(solution, t), d: answered(delivery, t) }));
    if (per.some((b) => !b.s && !b.d)) { orphans.push(c.id); continue; }
    const both = per.filter((b) => b.s && b.d).every((b) => cross.includes(b.t));
    const branches = new Set(per.flatMap((b) => [b.s && "S", b.d && "D"].filter(Boolean)));
    if (!both || (branches.size === 2 && !per.some((b) => b.s && b.d))) unsplit.push(c.id);
  }
  assert.deepEqual(orphans, [], "every target is answered by an Architecture element");
  assert.deepEqual(unsplit, [], "a Case verifies leaves of one branch, or a listed cross-cutting Requirement; split the rest");
});

test("foundation/T66 [foundation/F40]: no 04-test check folder holds a Case", () => {
  const holders = files(join(PACKAGE, "04-test")).filter((f) => !f.includes("/plan/") && /\.test\.(mjs|ts)$/.test(f) && /\btest\(/.test(readFileSync(join(PACKAGE, "04-test", f), "utf8")));
  assert.deepEqual(holders, [], "Cases sit beside the Node that motivated them; the suites only collect");
});

test("foundation/T67 [foundation/F41]: the build leaves a delivery folder out of dist", () => {
  const copy = join(scratch, "package");
  mkdirSync(join(copy, "04-test", "engineering-check"), { recursive: true });
  cpSync(join(PACKAGE, "04-test", "engineering-check", "build.mjs"), join(copy, "04-test", "engineering-check", "build.mjs"));
  mkdirSync(join(copy, "02-requirements", "functional", "delivery"), { recursive: true });
  writeFileSync(join(copy, "02-requirements", "functional", "requirements.md"), "x\n");
  writeFileSync(join(copy, "02-requirements", "functional", "delivery", "pack.test.mjs"), "x\n");
  const r = spawnSync(process.execPath, [join(copy, "04-test", "engineering-check", "build.mjs")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(copy, "dist", "docs", "requirements", "functional", "requirements.md")), "the Solution file ships");
  assert.ok(!existsSync(join(copy, "dist", "docs", "requirements", "functional", "delivery")), "a delivery folder never ships");
});

test("foundation/T68 [foundation/F42]: the engineering suite is collected and not a hand-kept list of files", () => {
  const scripts = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).scripts;
  assert.doesNotMatch(scripts["test:publisher"], /\.test\.mjs/, "test:publisher names test files by hand");
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
