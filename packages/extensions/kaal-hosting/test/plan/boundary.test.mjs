// hosting/C13 planned outer tests: the platform coupling conformance suite
// (hosting/F27–hosting/F34, hosting/N5). Immutable to DO and CHECK;
// hosting/C14 turns them GREEN. Each title names the contracts it checks.
// The fixtures are the suite's positive and negative cases: each rule and each
// kind has one that must be found and a similar one that must not
// (hosting/N5). They reach Hosting through its build, its command and its
// manifest by path, never through the package name, so a rename needs no edit.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execute } from "../../dist/index.js";
import * as conformance from "../../dist/conformance.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SUITE = join(PACKAGE, "dist", "boundary.js");
const COMMAND = join(PACKAGE, "bin", "kaal-hosting-boundary.mjs");
const SKILL = join(PACKAGE, "skills", "kaal-hosting-boundary", "SKILL.md");

/** Sources keyed by path, as Hosting's `read` returns them. */
const files = (sources) => Object.fromEntries(Object.entries(sources).map(([path, text]) => [path, Buffer.from(text)]));

async function couplings(sources, options) {
  assert.equal(typeof conformance.couplings, "function", "kaal-hosting/conformance exports no couplings");
  return conformance.couplings(files(sources), options);
}

/** The findings of `report` on `line` of `file`, as [rule, kind] pairs. */
const at = (report, file, line) =>
  report.findings
    .filter((f) => f.file === file && f.line === line)
    .map((f) => [f.rule, f.kind])
    .sort();

const kinds = (report, file) => [...new Set(report.findings.filter((f) => f.file === file).map((f) => f.kind))].sort();

describe("hosting/C13: platform coupling conformance", () => {
  it("hosting/T32 [hosting/F28, hosting/F29]: production code asking the host which platform it is is a coupling finding at its exact place, however os, path or process is reached, and an alias's uses are found too", async () => {
    const report = await couplings({
      "src/a.mjs": [
        'import os from "node:os";', // 1
        'import { platform as which } from "os";', // 2
        'import * as path from "node:path";', // 3
        "const { platform } = process;", // 4
        "export const w = process.platform;", // 5
        "export const x = os.platform();", // 6
        "export const y = which();", // 7
        "export const z = path.sep;", // 8
        'const WINDOWS = process.platform === "win32";', // 9
        "export const v = WINDOWS ? 1 : 2;", // 10
        "export const u = os.EOL + path.posix.join('a');", // 11
      ].join("\n"),
      "src/clean.mjs": ['import os from "node:os";', 'import { join } from "node:path";', "export const t = os.tmpdir();", "export const c = process.cwd();", "export const j = join('a', 'b');", "export const e = process.env.CI;"].join("\n"),
    });
    const f5 = report.findings.find((f) => f.file === "src/a.mjs" && f.line === 5);
    assert.deepEqual({ ...f5, acknowledged: undefined }, { file: "src/a.mjs", line: 5, column: 18, scope: "production", rule: "platform-query", kind: "coupling", construct: "process.platform", acknowledged: undefined });
    for (const line of [4, 5, 6, 7, 8, 10, 11]) assert.ok(at(report, "src/a.mjs", line).some(([rule, kind]) => rule === "platform-query" && kind === "coupling"), `no platform-query coupling on line ${line}`);
    assert.ok(at(report, "src/a.mjs", 9).some(([rule]) => rule === "platform-literal"), "the literal on line 9 is not found");
    assert.deepEqual(report.findings.filter((f) => f.file === "src/clean.mjs"), [], "the clean file has findings");
  });

  it("hosting/T33 [hosting/F28]: a string literal naming a platform is found, and a mention in a comment, an identifier or a longer word is not", async () => {
    const report = await couplings({
      "src/b.mjs": ['export const a = (p) => p === "win32";', 'export function b(p) { switch (p) { case "darwin": return 1; } }', "export const c = ['linux', `freebsd`];"].join("\n"),
      "src/quiet.mjs": ['// on "win32" and "darwin" this differs', "/* process.platform === 'linux' */", "export const win32Path = 1;", 'export const s = "linuxy";', 'export const t = "my windows";'].join("\n"),
    });
    assert.deepEqual(at(report, "src/b.mjs", 1), [["platform-literal", "coupling"]]);
    assert.deepEqual(at(report, "src/b.mjs", 2), [["platform-literal", "coupling"]]);
    assert.equal(report.findings.filter((f) => f.file === "src/b.mjs" && f.line === 3).length, 2);
    assert.deepEqual(report.findings.filter((f) => f.file === "src/quiet.mjs"), []);
  });

  it("hosting/T34 [hosting/F29, hosting/N5]: in test code, a platform decision about whether a test is registered or run is a registration finding, as in guard/T114, and a skip that does not depend on the platform is no finding", async () => {
    const report = await couplings({
      "test/t114.test.mjs": [
        'import { it } from "node:test";', // 1
        'const WINDOWS = process.platform === "win32";', // 2
        'it("special files", { skip: WINDOWS }, () => {});', // 3
        'it("socket", (t) => {', // 4
        '  if (process.platform === "win32") return t.skip("no socket in a tree");', // 5
        "});", // 6
        'if (!WINDOWS) it("fifo", () => {});', // 7
        '(WINDOWS ? it.skip : it)("mode", () => {});', // 8
        'it("early", () => {', // 9
        "  if (WINDOWS) return;", // 10
        "});", // 11
      ].join("\n"),
      "test/plain.test.mjs": ['import { it } from "node:test";', 'const hasGit = !!process.env.GIT;', 'it.skip("not yet", () => {});', 'it("git", { skip: !hasGit }, () => {});'].join("\n"),
    });
    for (const line of [3, 5, 7, 8, 10]) assert.ok(at(report, "test/t114.test.mjs", line).some(([, kind]) => kind === "registration"), `no registration finding on line ${line}`);
    assert.ok(report.findings.every((f) => f.scope === "test"));
    assert.deepEqual(report.findings.filter((f) => f.file === "test/plain.test.mjs"), []);
  });

  it("hosting/T35 [hosting/F29]: in test code, a platform decision about what is asserted is a dilution finding, distinct from the same fixture setup with the assertion outside the branch, which is a setup finding", async () => {
    const report = await couplings({
      "test/dilution.test.mjs": [
        'import assert from "node:assert/strict";', // 1
        'const WINDOWS = process.platform === "win32";', // 2
        'if (process.platform !== "win32") assert.equal(mode, 0o755);', // 3
        'assert.equal(out, WINDOWS ? "a\\r\\n" : "a\\n");', // 4
        "if (!WINDOWS) {", // 5
        "  assert.ok(executable);", // 6
        "}", // 7
        "expect(count).toBe(WINDOWS ? 1 : 2);", // 8
      ].join("\n"),
      "test/setup.test.mjs": [
        'import assert from "node:assert/strict";', // 1
        'const WINDOWS = process.platform === "win32";', // 2
        "let fixture;", // 3
        "if (WINDOWS) {", // 4
        '  fixture = makeDirectory("x");', // 5
        "} else {", // 6
        '  fixture = makeLink("x");', // 7
        "}", // 8
        "const command = WINDOWS ? first : second;", // 9
        "assert.equal(kindOf(fixture), \"changed\");", // 10
      ].join("\n"),
    });
    for (const line of [3, 4, 5, 8]) assert.ok(at(report, "test/dilution.test.mjs", line).some(([, kind]) => kind === "dilution"), `no dilution finding on line ${line}`);
    assert.ok(!kinds(report, "test/dilution.test.mjs").includes("registration"));
    assert.deepEqual(kinds(report, "test/setup.test.mjs"), ["setup"]);
    for (const line of [4, 9]) assert.ok(at(report, "test/setup.test.mjs", line).some(([, kind]) => kind === "setup"), `no setup finding on line ${line}`);
  });

  it("hosting/T36 [hosting/F28]: a host-specific mechanism Hosting mediates is a host-api finding, and the portable form of each is not", async () => {
    const report = await couplings({
      "src/host.mjs": [
        'import { spawn, execFile, spawnSync } from "node:child_process";', // 1
        'import { chmodSync, symlinkSync } from "node:fs";', // 2
        'import net from "node:net";', // 3
        'import os from "node:os";', // 4
        'spawn("npm", ["test"], { shell: true });', // 5
        'execFile("cmd.exe", ["/c", "dir"]);', // 6
        'spawnSync("mkfifo", [path]);', // 7
        "net.createServer().listen(socketPath);", // 8
        "chmodSync(file, 0o755);", // 9
        'symlinkSync(target, link, "junction");', // 10
        "const uid = process.getuid();", // 11
        "const ext = process.env.PATHEXT;", // 12
        "const home = os.homedir();", // 13
      ].join("\n"),
      "src/portable.mjs": [
        'import { spawn } from "node:child_process";',
        'import { symlinkSync } from "node:fs";',
        'import net from "node:net";',
        'spawn(process.execPath, ["x.mjs"]);',
        "net.createServer().listen(0);",
        "symlinkSync(target, link);",
        "const ci = process.env.CI;",
      ].join("\n"),
    });
    for (let line = 5; line <= 13; line++) assert.ok(at(report, "src/host.mjs", line).some(([rule, kind]) => rule === "host-api" && kind === "coupling"), `no host-api finding on line ${line}`);
    assert.deepEqual(report.findings.filter((f) => f.file === "src/portable.mjs"), []);
  });

  it("hosting/T37 [hosting/F30]: an acknowledgement with a reason, on the finding's line or just above it, marks the finding acknowledged and keeps it; one without a reason, or further away, does not", async () => {
    const report = await couplings({
      "test/ack.test.mjs": [
        'import { it } from "node:test";', // 1
        "// kaal-hosting: platform Windows holds no FIFO in a directory", // 2
        'it("fifo", { skip: process.platform === "win32" }, () => {});', // 3
        'it("eol", { skip: process.platform === "win32" }, () => {}); // kaal-hosting: platform CRLF is out of scope', // 4
        "// kaal-hosting: platform", // 5
        'it("bare", { skip: process.platform === "win32" }, () => {});', // 6
        "// kaal-hosting: platform too far away", // 7
        "", // 8
        'it("far", { skip: process.platform === "win32" }, () => {});', // 9
      ].join("\n"),
    });
    const on = (line) => report.findings.filter((f) => f.line === line);
    assert.ok(on(3).length > 0 && on(3).every((f) => f.acknowledged === "Windows holds no FIFO in a directory"));
    assert.ok(on(4).length > 0 && on(4).every((f) => f.acknowledged === "CRLF is out of scope"));
    for (const line of [6, 9]) assert.ok(on(line).length > 0 && on(line).every((f) => f.acknowledged === undefined), `line ${line} is acknowledged`);
    assert.ok(report.findings.every((f) => f.kind === "registration"), "an acknowledgement changed a finding's kind");
  });

  it("hosting/T38 [hosting/F27, hosting/F32]: TypeScript is read, declarations and non-sources are skipped with a reason, scope follows the path or the caller's rule, and the report is stable and states its coverage", async () => {
    const sources = {
      "src/a.ts": "export const w: string = process.platform;\n",
      "src/b.d.ts": "export declare const w: typeof process.platform;\n",
      "package.json": '{ "os": ["linux"] }\n',
      "scripts/run.mjs": "export const w = process.platform;\n",
      "lib/fixtures/f.mjs": "export const w = process.platform;\n",
      "lib/x.spec.ts": "export const w = process.platform;\n",
      "test/helpers.cjs": "module.exports = process.platform;\n",
    };
    const report = await couplings(sources);
    assert.deepEqual(at(report, "src/a.ts", 1), [["platform-query", "coupling"]]);
    assert.deepEqual(report.skipped.map((s) => s.file).sort(), ["package.json", "src/b.d.ts"]);
    assert.ok(report.skipped.every((s) => typeof s.reason === "string" && s.reason.length > 0));
    assert.deepEqual(report.sources.map((s) => s.file), ["lib/fixtures/f.mjs", "lib/x.spec.ts", "scripts/run.mjs", "src/a.ts", "test/helpers.cjs"]);
    const scope = (file) => report.findings.find((f) => f.file === file)?.scope;
    assert.equal(scope("src/a.ts"), "production");
    for (const file of ["scripts/run.mjs", "lib/fixtures/f.mjs", "lib/x.spec.ts", "test/helpers.cjs"]) assert.equal(scope(file), "test", file);
    const custom = await couplings(sources, { test: (path) => path === "src/a.ts" });
    assert.equal(custom.findings.find((f) => f.file === "src/a.ts")?.scope, "test");
    assert.equal(custom.findings.find((f) => f.file === "scripts/run.mjs")?.scope, "production");
    assert.deepEqual(await couplings(sources), report);
    assert.ok(Array.isArray(report.coverage) && report.coverage.length > 0);
    assert.ok(Array.isArray(report.exclusions) && report.exclusions.some((e) => /data|run time|outside/i.test(e)));
  });

  it("hosting/T39 [hosting/F31, hosting/F33, hosting/F30, hosting/F32, hosting/N5]: the shipped suite tests deterministically what it can and requests a review for the rest: on a capability with production coupling and T114-style skipped tests and assertions it fails, gives every finding at its exact place, requests a review, under a stable id and Hosting's rule, for each test-code finding, acknowledged ones included, and states the sources it read; a capability needing only judgment is never passed; a clean one is verified; one that cannot be inspected is unknown; the command gives the same result with distinct exit codes", async () => {
    const capability = (tree) => {
      const root = mkdtempSync(join(tmpdir(), "kaal-boundary-"));
      for (const [path, text] of Object.entries(tree)) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), text);
      }
      return root;
    };
    const t114 = [
      'import assert from "node:assert/strict";', // 1
      'import { it } from "node:test";', // 2
      'const WINDOWS = process.platform === "win32";', // 3
      'it("special files", { skip: WINDOWS }, () => {});', // 4
      'it("mode", () => {', // 5
      "  if (!WINDOWS) assert.equal(mode(), 0o755);", // 6
      "});", // 7
      "// kaal-hosting: platform Windows holds no FIFO in a directory", // 8
      'it("fifo", { skip: process.platform === "win32" }, () => {});', // 9
    ].join("\n");
    // The negative fixture: production code reaching past Hosting, and T114-style tests and assertions skipped on Windows.
    const negative = capability({
      "src/index.mjs": 'import { readFile } from "node:fs/promises";\nexport const r = (p) => readFile(p);\nexport const eol = process.platform; // kaal-hosting: platform acknowledged, still a coupling\n',
      "test/t114.test.mjs": t114,
      "test/fixtures/tree.mjs": 'export const separator = process.platform === "win32" ? "\\\\" : "/";\n',
      "scripts/build.mjs": "export const ok = 1;\n",
      "README.md": "# fixture\n",
    });
    // Only judgment: production leaves the host to Hosting, and a test fixture is built per platform.
    const judgment = capability({
      "src/index.mjs": "export const add = (a, b) => a + b;\n",
      "test/fixtures/tree.mjs": 'export const separator = process.platform === "win32" ? "\\\\" : "/";\n',
    });
    // The positive fixture: a capability that leaves the host to Hosting, with a skip that does not depend on the platform.
    const clean = capability({
      "src/index.mjs": "export const add = (a, b) => a + b;\n",
      "test/add.test.mjs": 'import { it } from "node:test";\nit("adds", { skip: !process.env.SLOW }, () => {});\n',
    });
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const boundary = (output) => {
      const line = output.stdout.split(/\r?\n/).map((l) => l.trim()).find((l) => l.startsWith("kaal-hosting-boundary "));
      assert.ok(line, `no kaal-hosting-boundary line\n${output.stdout}${output.stderr}`);
      return JSON.parse(line.slice("kaal-hosting-boundary ".length));
    };
    const driver = (target, builtins) => `import { boundarySuite } from ${JSON.stringify(pathToFileURL(SUITE).href)};\nboundarySuite({ name: "fixture", root: ${JSON.stringify(target)}, builtins: ${JSON.stringify(builtins)} });\n`;
    const run = async (target, builtins = []) => {
      const script = join(mkdtempSync(join(tmpdir(), "kaal-boundary-driver-")), "driver.test.mjs");
      writeFileSync(script, driver(target, builtins));
      // Run directly, so the suite's own output reaches stdout as written, with no reporter's escaping.
      return execute(process.execPath, [script], { cwd: tmpdir(), env });
    };
    const command = (target, builtins = []) => execute(process.execPath, [COMMAND, "--name", "fixture", "--root", target, ...builtins.flatMap((b) => ["--builtin", b])], { cwd: tmpdir(), env });
    const outcomes = (result) => Object.fromEntries(result.cases.map((c) => [c.name, c.outcome]));
    const finding = (line, column, rule, kind, construct, acknowledged) => ({ file: "test/t114.test.mjs", line, column, scope: "test", rule, kind, construct, ...(acknowledged ? { acknowledged } : {}) });
    const BUILTINS = ["node:fs/promises", "node:test", "node:assert/strict"];

    // Deterministic: undeclared host modules and production coupling fail, even when acknowledged.
    const found = await run(negative);
    assert.notEqual(found.status, 0, "a deterministic failure passed");
    const result = boundary(found);
    assert.equal(result.name, "fixture");
    assert.equal(result.result, "failed");
    assert.deepEqual(outcomes(result), { "inspection completes": "pass", "host modules are declared": "fail", "production code leaves the host to Hosting": "fail" });
    assert.deepEqual(result.failures, []);
    const tests = [
      { file: "test/fixtures/tree.mjs", line: 1, column: 26, scope: "test", rule: "platform-query", kind: "setup", construct: "process.platform" },
      { file: "test/fixtures/tree.mjs", line: 1, column: 47, scope: "test", rule: "platform-literal", kind: "setup", construct: '"win32"' },
      finding(3, 17, "platform-query", "setup", "process.platform"),
      finding(3, 38, "platform-literal", "setup", '"win32"'),
      finding(4, 29, "platform-query", "registration", "WINDOWS"),
      finding(6, 8, "platform-query", "dilution", "WINDOWS"),
      finding(9, 20, "platform-query", "registration", "process.platform", "Windows holds no FIFO in a directory"),
      finding(9, 41, "platform-literal", "registration", '"win32"', "Windows holds no FIFO in a directory"),
    ];
    assert.deepEqual(result.findings, [{ file: "src/index.mjs", line: 3, column: 20, scope: "production", rule: "platform-query", kind: "coupling", construct: "process.platform", acknowledged: "acknowledged, still a coupling" }, ...tests]);
    // Judgment: every test-code finding is a review request, an acknowledged one too, and none is a passed case.
    assert.equal(result.review, "requested");
    assert.deepEqual(result.reviews.map((r) => r.finding), tests, "a test-code finding is not put to review, or an acknowledgement approved one");
    assert.ok(result.reviews.every((r) => typeof r.question === "string" && r.question.length > 0), "a review request asks nothing");
    for (const r of result.reviews) {
      assert.deepEqual(Object.keys(r).sort(), ["finding", "id", "owner", "question", "rule"], "a review request carries an outcome or lacks a member");
      assert.deepEqual([r.owner, r.rule, r.id], ["Hosting", `kaal-hosting/${r.finding.rule}`, `kaal-hosting/${r.finding.rule}@${r.finding.file}:${r.finding.line}:${r.finding.column}`]);
    }
    assert.deepEqual(result.summary, { coupling: 1, registration: 3, dilution: 1, setup: 4, acknowledged: 3 });
    assert.deepEqual(result.sources, [
      { file: "scripts/build.mjs", scope: "test" },
      { file: "src/index.mjs", scope: "production" },
      { file: "test/fixtures/tree.mjs", scope: "test" },
      { file: "test/t114.test.mjs", scope: "test" },
    ]);
    assert.deepEqual(result.skipped.map((s) => s.file), ["README.md"]);
    assert.ok(result.violations.some((v) => v.builtin === "node:fs/promises"), "the existing inspect is not part of the suite");

    const asked = await run(judgment);
    const pending = boundary(asked);
    assert.deepEqual([pending.result, pending.review, pending.reviews.length], ["verified", "requested", 2]);
    assert.match(asked.stdout, /todo 1\b/, "a pending review is reported as a passed case");

    const verified = boundary(await run(clean, ["node:test"]));
    assert.deepEqual([verified.result, verified.review, verified.findings, verified.reviews], ["verified", "none", [], []]);

    const missing = await run(join(negative, "no-such-capability"));
    assert.notEqual(missing.status, 0, "an inspection that cannot complete passed");
    const failed = boundary(missing);
    assert.equal(failed.result, "unknown");
    assert.ok(failed.failures.length > 0, "a deterministic failure is not stated");
    assert.deepEqual(failed.findings, []);

    // Called as a command, with no capability importing Hosting.
    const alone = await command(negative, BUILTINS);
    assert.equal(alone.status, 1, `${alone.stdout}${alone.stderr}`);
    const own = boundary(alone);
    assert.deepEqual(own.findings, result.findings);
    assert.deepEqual(own.reviews.map((r) => r.id), result.reviews.map((r) => r.id), "a review request's id changes between runs");
    assert.deepEqual(own.violations, [], "a declared builtin is still a violation");
    assert.deepEqual(outcomes(own), { "inspection completes": "pass", "host modules are declared": "pass", "production code leaves the host to Hosting": "fail" });
    assert.equal((await command(judgment)).status, 3, "review requested is not its own exit code");
    assert.equal((await command(clean, ["node:test"])).status, 0);
    assert.equal((await command(join(negative, "no-such-capability"))).status, 2);
  });

  it("hosting/T40 [hosting/F34, hosting/F31]: the package ships the suite, its command and its review instructions for consumers, and neither the production nor the inspection entry loads a test harness", () => {
    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.equal(manifest.exports?.["./boundary"]?.default, "./dist/boundary.js");
    assert.equal(manifest.bin?.["kaal-hosting-boundary"], "bin/kaal-hosting-boundary.mjs");
    for (const entry of ["bin", "skills"]) assert.ok(manifest.files.includes(entry), `${entry} does not ship`);
    for (const entry of ["dist/index.js", "dist/conformance.js"]) assert.doesNotMatch(readFileSync(join(PACKAGE, entry), "utf8"), /["']node:test["']/, `${entry} loads node:test`);
    assert.ok(existsSync(SKILL), "no review instructions");
    const skill = readFileSync(SKILL, "utf8");
    assert.match(skill, /^---\nname: kaal-hosting-boundary\ndescription: \S/);
    assert.match(skill, /^## Bare/m, "the instructions do not start from the line alone");
    for (const word of ["kaal-hosting-boundary", "coupling", "registration", "dilution", "setup", "acknowledged", "PREACH"]) assert.ok(skill.includes(word), `the instructions do not cover ${word}`);
  });
});
