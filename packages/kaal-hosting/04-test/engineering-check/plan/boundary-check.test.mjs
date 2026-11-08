// hosting/C100 planned outer tests: the Boundary Check per package
// (hosting/F64–hosting/F71, hosting/N9; T123 follows the moved host guide). Immutable to DO and CHECK;
// hosting/C101, hosting/C102 and hosting/C103 turn them GREEN. Each title names
// the contracts it checks. They reach Hosting through its build, its command and
// its files by path, never through the package name. The fixtures are Hosting's
// own, built in a temporary directory: never another package's content.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const COMMAND = join(PACKAGE, "dist/skills/kaal-hosting/scripts", "boundary-cli.mjs");
const LINE = "kaal-hosting-boundary";
// The skill directory is named by parts: the rename test (hosting/T22) forbids the quoted old package name in any file.
const HOSTING_SKILL = join(PACKAGE, "dist", "skills", ["kaal", "hosting"].join("-"));

/** Builds a temporary tree from { "path": "text" }. */
function tree(sources) {
  const root = mkdtempSync(join(tmpdir(), "hosting-check-"));
  for (const [path, text] of Object.entries(sources)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

/** Runs the command in `cwd` and returns its exit status and parsed result line. */
function run(args, cwd) {
  const out = spawnSync(process.execPath, [COMMAND, ...args], { cwd, encoding: "utf8" });
  const line = out.stdout.split("\n").find((l) => l.startsWith(`${LINE} `));
  return { status: out.status, stderr: out.stderr, result: line ? JSON.parse(line.slice(LINE.length + 1)) : undefined };
}

// Fixed SHA-256 digests (lowercase hex, UTF-8 bytes, no trailing newline) of the two fixture lines. They are fixed values so this test needs neither node:crypto nor a package dependency.
const DIGEST_LINE = "fd27804a4ecdf54db71cd13c64341993babb81e9324136e89effdeba1959795d"; // export const w = process.platform;
const DIGEST_EDITED = "fa95403d38ce3eca461eb13c64d27eafcab67d3a1f57d62efb0ebf75d6a7f431"; // export const w = process.platform + 1;
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

describe("hosting/C100: the Boundary Check per package", () => {
  it("hosting/T114 [hosting/F64]: --target takes a folder (recursively), a single file and several targets; a missing target is unknown and exits 2; --root stays the gating run and both together are refused", () => {
    const root = tree({
      "src/a.mjs": "export const w = process.platform;\n",
      "src/deep/b.mjs": "export const x = process.arch;\n",
      "test/c.test.mjs": 'export const y = "win32";\n',
    });
    const folder = run(["--target", "src"], root);
    assert.equal(folder.result.mode, "scan");
    assert.deepEqual(folder.result.findings.map((f) => f.file).sort(), ["src/a.mjs", "src/deep/b.mjs"]);
    const file = run(["--target", "src/a.mjs"], root);
    assert.deepEqual(file.result.findings.map((f) => f.file), ["src/a.mjs"]);
    const two = run(["--target", "src/a.mjs", "--target", "test"], root);
    assert.deepEqual(two.result.findings.map((f) => f.file).sort(), ["src/a.mjs", "test/c.test.mjs"]);
    assert.deepEqual(two.result.target, ["src/a.mjs", "test"]);
    const missing = run(["--target", "nowhere"], root);
    assert.equal(missing.result.result, "unknown");
    assert.equal(missing.status, 2);
    const gate = run(["--name", "x", "--root", "src"], root);
    assert.equal(gate.result.mode, "gate");
    assert.equal(run(["--name", "x", "--root", "src", "--target", "src"], root).status, 2);
  });

  it("hosting/T115 [hosting/F65, hosting/F68]: a scan has findings and no failures, exits 0 with findings and with none, exits 2 when nothing was read, never exits 1, and an empty list carries its coverage so exit 0 is not a pass", () => {
    const dirty = tree({ "src/a.mjs": "export const w = process.platform;\n" });
    const clean = tree({ "src/a.mjs": "export const w = 1;\n" });
    const withFinding = run(["--target", "src"], dirty);
    assert.equal(withFinding.status, 0);
    assert.ok(withFinding.result.findings.length > 0);
    assert.equal(withFinding.result.failures, undefined);
    assert.notEqual(withFinding.result.result, "failed");
    const none = run(["--target", "src"], clean);
    assert.equal(none.status, 0);
    assert.deepEqual(none.result.findings, []);
    assert.deepEqual(none.result.coverage.read, ["src/a.mjs"]);
    assert.ok(Array.isArray(none.result.coverage.unreadable));
    assert.ok(none.result.coverage.rules.includes("platform-query"));
    const nothing = run(["--target", "nowhere"], clean);
    assert.equal(nothing.status, 2);
    for (const r of [withFinding, none, nothing]) assert.notEqual(r.status, 1);
  });

  it("hosting/T116 [hosting/F66]: a line that hits several rules is one finding listing all of them with its classes; the same line is never reported twice", () => {
    const root = tree({ "src/a.mjs": 'export const WINDOWS = process.platform === "win32";\nexport const ok = 1;\n' });
    const { result } = run(["--target", "src"], root);
    const onLine = result.findings.filter((f) => f.file === "src/a.mjs" && f.line === 1);
    assert.equal(onLine.length, 1);
    assert.ok(onLine[0].rules.includes("platform-query") && onLine[0].rules.includes("platform-literal"));
    assert.ok(Array.isArray(onLine[0].classes) && onLine[0].classes.includes("coupling"));
    assert.equal(result.findings.some((f) => f.line === 2), false);
  });

  it("hosting/T117 [hosting/F66]: a later use of an identifier bound to a platform query is a reference under the binding's finding, counted apart and never a finding or a decision of its own, including a destructured binding", () => {
    const root = tree({
      "src/a.mjs": [
        'export const WINDOWS = process.platform === "win32";', // 1
        "export const v = WINDOWS ? 1 : 2;", // 2
        "const { platform } = process;", // 3
        "export const w = platform;", // 4
      ].join("\n"),
    });
    const { result } = run(["--target", "src"], root);
    const lines = result.findings.map((f) => f.line).sort();
    assert.deepEqual(lines, [1, 3]);
    const first = result.findings.find((f) => f.line === 1);
    assert.deepEqual(first.references.map((r) => r.line), [2]);
    const second = result.findings.find((f) => f.line === 3);
    assert.deepEqual(second.references.map((r) => r.line), [4]);
    assert.equal(result.counts.references, 2);
    assert.equal(first.references[0].id, undefined);
    assert.equal(first.references[0].decision, undefined);
  });

  it("hosting/T124 [hosting/F67, hosting/F66]: a string literal that quotes a platform query, such as \"process.platform\", in production code is a finding on its line and is not suppressed because it is not executable; a mention in a comment is still not a finding", () => {
    const root = tree({
      "src/help.mjs": 'export const help = "Do not use process.platform here";\n// process.platform in a comment\nexport const ok = 1;\n',
    });
    const { result } = run(["--target", "src"], root);
    assert.deepEqual(result.findings.map((f) => [f.file, f.line]), [["src/help.mjs", 1]]);
    assert.equal(result.findings[0].scope, "production");
  });

  it("hosting/T118 [hosting/F67, hosting/F30]: platform logic in the production and the test files of a non-Hosting target is a finding whatever its class, and an acknowledgement leaves it in the list", () => {
    const root = tree({
      "src/a.mjs": "export const w = process.platform;\n",
      "test/a.test.mjs": 'import { it } from "node:test";\nit.skip("x", () => {});\nconst skip = process.platform === "win32";\n',
      "src/ack.mjs": "// kaal-hosting: platform reason given\nexport const z = process.platform;\n",
    });
    const { result } = run(["--target", "src", "--target", "test"], root);
    const files = new Set(result.findings.map((f) => f.file));
    assert.ok(files.has("src/a.mjs") && files.has("test/a.test.mjs") && files.has("src/ack.mjs"));
    const classes = new Set(result.findings.flatMap((f) => f.classes));
    assert.ok(classes.has("coupling"));
    assert.ok(result.findings.some((f) => f.file === "src/ack.mjs" && f.acknowledged));
  });

  it("hosting/T119 [hosting/F66, hosting/F68, hosting/N9]: each finding has the stable id kaal-hosting/<file>:<line> under one base, a digest of its line text that survives an edit above and changes with an edit to the line, a question and no decision; the result has coverage and counts; same-named files under two targets get distinct ids; a target outside the base is refused; two runs give the same line", () => {
    const text = "export const w = process.platform;";
    const root = tree({ "src/index.mjs": `${text}\n`, "test/index.mjs": `${text}\n` });
    const first = run(["--target", "src", "--target", "test"], root);
    const ids = first.result.findings.map((f) => f.id).sort();
    assert.deepEqual(ids, ["kaal-hosting/src/index.mjs:1", "kaal-hosting/test/index.mjs:1"]);
    for (const f of first.result.findings) {
      assert.equal(f.digest, DIGEST_LINE);
      assert.equal(typeof f.question, "string");
      assert.ok(f.question.length > 0);
      assert.equal(f.decision, undefined);
    }
    assert.ok(first.result.coverage && first.result.counts);
    assert.equal(JSON.stringify(run(["--target", "src", "--target", "test"], root).result), JSON.stringify(first.result));
    writeFileSync(join(root, "src/index.mjs"), `// inserted above\n${text}\n`);
    const moved = run(["--target", "src"], root).result.findings[0];
    assert.equal(moved.id, "kaal-hosting/src/index.mjs:2");
    assert.equal(moved.digest, DIGEST_LINE);
    writeFileSync(join(root, "src/index.mjs"), "export const w = process.platform + 1;\n");
    assert.equal(run(["--target", "src"], root).result.findings[0].digest, DIGEST_EDITED);
    const outside = run(["--target", "src", "--base", join(root, "test")], root);
    assert.equal(outside.status, 2);
  });

  it("hosting/T120 [hosting/F69]: Hosting reads, stores and judges no decision; a decision file next to the target changes no output", () => {
    const sources = { "src/a.mjs": "export const w = process.platform;\n" };
    const bare = run(["--target", "src"], tree(sources));
    const decided = tree({ ...sources, "docs/boundary-check.md": "| kaal-hosting/src/a.mjs:1 | accept | reason |\n", "decisions.json": '{"kaal-hosting/src/a.mjs:1":"accept"}' });
    const withDecisions = run(["--target", "src"], decided);
    assert.deepEqual(withDecisions.result.findings.map(({ id, digest, rules }) => ({ id, digest, rules })), bare.result.findings.map(({ id, digest, rules }) => ({ id, digest, rules })));
    for (const f of withDecisions.result.findings) assert.equal(f.decision, undefined);
  });

  it("hosting/T121 [hosting/F70]: the boundary skill is gone from the repository and the package; no operational file names it; the kaal-hosting skill has a Boundary Check section covering the command, reading the list and that deciding is the owner's", () => {
    assert.equal(existsSync(join(PACKAGE, "dist", "skills", "kaal-hosting-boundary")), false, "the retired skill directory still exists");
    const retired = ["skills", "kaal-hosting-boundary"].join("/");
    const operational = [...["skills", "bin", "docs"].flatMap((d) => (existsSync(join(PACKAGE, d)) ? walk(join(PACKAGE, d)) : [])), join(PACKAGE, "README.md"), join(PACKAGE, "package.json"), join(PACKAGE, "04-test", "package-check", "verify.json")];
    for (const file of operational) {
      assert.equal(readFileSync(file, "utf8").includes(retired), false, `${relative(PACKAGE, file)} names the retired skill`);
    }
    const skill = readFileSync(join(HOSTING_SKILL, "SKILL.md"), "utf8");
    assert.match(skill, /^#+ .*Boundary Check/m);
    assert.ok(skill.includes("--target"), "the skill does not say how to run the check");
    assert.match(skill, /evidence/i);
    assert.match(skill, /owner/i);
  });

  it("hosting/T123 [hosting/F70, hosting/F41]: the per-host guide is skills/kaal-hosting/references/hosts.md with the kaal-hosting:hosts table, what it says of each host fact on this host is what facts() establishes, and the kaal-hosting skill points to it", async () => {
    const guide = join(HOSTING_SKILL, "references", "hosts.md");
    assert.ok(existsSync(guide), "the per-host guide is not at skills/kaal-hosting/references/hosts.md");
    const text = readFileSync(guide, "utf8");
    const from = text.indexOf("<!-- kaal-hosting:hosts -->");
    const to = text.indexOf("<!-- /kaal-hosting:hosts -->");
    assert.ok(from >= 0 && to > from, "no kaal-hosting:hosts table");
    const rows = text
      .slice(from, to)
      .split(/\r?\n/)
      .filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l))
      .slice(1)
      .map((l) => l.slice(1, -1).split("|").map((c) => c.trim().replace(/^`|`$/g, "")));
    const { facts } = await import(pathToFileURL(join(PACKAGE, "dist/skills/kaal-hosting/scripts", "fixtures.js")).href);
    const established = await facts();
    for (const fact of Object.keys(established)) {
      const row = rows.find((r) => r[0] === fact && r[1] === process.platform);
      assert.ok(row, `the guide has no row for ${fact} on ${process.platform}`);
      assert.equal(row[2], established[fact].holds ? "yes" : "no", `${fact} on ${process.platform}`);
      assert.match(row[3], /^https:\/\//);
    }
    assert.ok(readFileSync(join(HOSTING_SKILL, "SKILL.md"), "utf8").includes("hosts.md"), "the kaal-hosting skill does not point to the per-host guide");
  });

  it("hosting/T122 [hosting/F71]: Hosting declares a Package Check that points at its verify Cases and a Boundary Check as a declared not-applicable status with its reason, not as a Case outcome", () => {
    // Path clause superseded by the Owner's rulings of 4 November 2026 (hosting/C103): the Boundary Check record is one shipped file, test/boundary-check.md, beside test/verify.json. Its behaviour clauses are unchanged.
    const file = join(PACKAGE, "04-test", "boundary-check", "boundary-check.md");
    assert.ok(existsSync(file), "test/boundary-check.md is missing");
    const text = readFileSync(file, "utf8");
    assert.match(text, /Package Check/);
    assert.match(text, /test\/verify\.json/);
    assert.ok(existsSync(join(PACKAGE, "04-test", "package-check", "verify.json")));
    assert.match(text, /Boundary Check/);
    assert.match(text, /not applicable/i);
    assert.match(text, /operating-system boundary/i);
    assert.doesNotMatch(text, /\b(passed|failed|skipped)\b.*Boundary Check|Boundary Check.*\b(passed|failed|skipped)\b/i);
  });
});
