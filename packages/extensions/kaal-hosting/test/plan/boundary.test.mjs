// hosting/C13 planned outer tests: the platform coupling conformance suite
// (hosting/F27–hosting/F32, hosting/N5). Immutable to DO and CHECK;
// hosting/C14 turns them GREEN. Each title names the contracts it checks.
// The fixtures are the suite's positive and negative cases: each rule and each
// kind has one that must be found and a similar one that must not
// (hosting/N5). They reach Hosting through its build and its publisher-only
// suite by path, never through the package name, so a rename needs no edit.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execute } from "../../dist/index.js";
import * as conformance from "../../dist/conformance.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SUITE = join(PACKAGE, "conformance", "boundary.mjs");

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
    assert.ok(report.findings.every((f) => f.kind === "registration"));
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

  it("hosting/T39 [hosting/F31, hosting/F30]: the reusable suite inspects a capability's sources, emits each finding and one kaal-hosting-boundary line for it, and fails only when the inspection cannot complete", async () => {
    const root = mkdtempSync(join(tmpdir(), "kaal-boundary-"));
    mkdirSync(join(root, "src"));
    mkdirSync(join(root, "test"));
    writeFileSync(join(root, "src", "index.mjs"), 'import { readFile } from "node:fs/promises";\nexport const r = (p) => readFile(p);\n');
    writeFileSync(join(root, "test", "t114.test.mjs"), 'import { it } from "node:test";\nit("special files", { skip: process.platform === "win32" }, () => {});\n');
    const driver = (target) => `import { boundarySuite } from ${JSON.stringify(pathToFileURL(SUITE).href)};\nboundarySuite({ name: "fixture", root: ${JSON.stringify(target)} });\n`;
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const run = async (target) => {
      const script = join(mkdtempSync(join(tmpdir(), "kaal-boundary-driver-")), "driver.test.mjs");
      writeFileSync(script, driver(target));
      // Run directly, so the suite's own output reaches stdout as written, with no reporter's escaping.
      return execute(process.execPath, [script], { cwd: root, env });
    };
    const found = await run(root);
    assert.equal(found.status, 0, `a finding failed the suite\n${found.stdout}${found.stderr}`);
    const line = found.stdout.split(/\r?\n/).map((l) => l.trim()).find((l) => l.startsWith("kaal-hosting-boundary "));
    assert.ok(line, `no kaal-hosting-boundary line\n${found.stdout}`);
    const result = JSON.parse(line.slice("kaal-hosting-boundary ".length));
    assert.equal(result.name, "fixture");
    assert.ok(result.findings.some((f) => f.file === "test/t114.test.mjs" && f.kind === "registration"), "the T114-like skip is not reported");
    assert.ok(Array.isArray(result.violations) && result.violations.some((v) => v.builtin === "node:fs/promises"), "the existing inspect is not part of the suite");
    const missing = await run(join(root, "no-such-capability"));
    assert.notEqual(missing.status, 0, "an inspection that cannot complete passed");
  });
});
