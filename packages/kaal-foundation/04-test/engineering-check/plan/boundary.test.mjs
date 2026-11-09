// foundation/C13 planned publisher cases: Foundation's Boundary Check (00-changes/boundary/*.md). Immutable to DO
// and CHECK; foundation/C14 moves this file unchanged to 04-test/engineering-check/publisher/ and turns it GREEN.
// It runs the generated dist/test/boundary-check/scan.mjs: run `npm run build` in this package first. Each title
// names the contracts it checks. Fixtures live in a temporary directory, so no npm and no network is needed. No
// platform is consulted and no shell is chosen (foundation/N7).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const DIST = join(PACKAGE, "dist");
const SCAN = join(DIST, "test", "boundary-check", "scan.mjs");
const SHA256_MJS = join(DIST, "skills", "kaal-foundation", "scripts", "sha256.mjs");
const SOURCE = join(PACKAGE, "05-src", "skills", "kaal-foundation");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const MAIN_SHA256_MJS = "c504c09d231c8a58f2ae2dbf346edbdf4dd544bdbdba1161515875d051df5ee0";
const MAIN_SHA256_DTS = "e0b71d43eb02726e7ed9fa05cf1c60c4b88224f99a5120de56bb54b3da303a16";

const scratch = mkdtempSync(join(tmpdir(), "foundation-boundary-"));
after(() => rmSync(scratch, { recursive: true, force: true }));
let n = 0;
const fresh = () => { const d = join(scratch, String(n++)); mkdirSync(d, { recursive: true }); return d; };
const put = (dir, file, text) => { mkdirSync(dirname(join(dir, file)), { recursive: true }); writeFileSync(join(dir, file), text); };

/** Runs the shipped scan under this Node, without a shell; never throws. */
const scan = (args, cwd) => {
  const r = spawnSync(process.execPath, [SCAN, ...args], { cwd, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};
/** The JSON of the last stdout line, which must be `kaal-foundation-scan {json}`, or null. */
const result = (stdout) => {
  const line = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).at(-1) ?? "";
  if (!line.startsWith("kaal-foundation-scan ")) return null;
  try { return JSON.parse(line.slice("kaal-foundation-scan ".length)); } catch { return null; }
};
const run = (args, cwd) => {
  const r = scan(args, cwd);
  const json = result(r.stdout);
  assert.ok(json, `no kaal-foundation-scan line (is the scan delivered?): ${r.stdout}${r.stderr}`);
  return { ...r, json };
};
const tree = (dir) => readdirSync(dir, { recursive: true }).sort().map((f) => { const p = join(dir, f); return statSync(p).isFile() ? `${f}:${hash(readFileSync(p))}` : f; });

const COPY = "sha256.mjs";
const CONSTANTS = "export const K = [\n  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,\n];\n";
const CRYPTO = "import { createHash } from \"node:crypto\";\nexport const d = (b) => createHash(\"sha256\").update(b).digest(\"hex\");\n";

test("foundation/T37 [foundation/F22]: the rules copy, implementation and crypto each give a finding at the expected file and line, and clean files give none", () => {
  const d = fresh();
  mkdirSync(join(d, "t", "vendor"), { recursive: true });
  cpSync(SHA256_MJS, join(d, "t", "vendor", COPY));
  put(d, "t/own.mjs", CONSTANTS);
  put(d, "t/uses.mjs", CRYPTO);
  put(d, "t/clean.mjs", "export const label = \"sha256sum\";\nexport const m = (b) => b.length;\n");
  put(d, "t/md5.mjs", "import { createHash } from \"node:crypto\";\nexport const m = (b) => createHash(\"md5\").update(b).digest(\"hex\");\n");
  const { status, json } = run(["--target", "t"], d);
  assert.equal(status, 0);
  const found = json.findings.map((f) => `${f.rule} ${f.file}:${f.line}`).sort();
  // A copy of Foundation's library is both a copy and, line 6 of it, the algorithm written out.
  assert.deepEqual(found, ["copy t/vendor/sha256.mjs:1", "crypto t/uses.mjs:2", "implementation t/own.mjs:2", "implementation t/vendor/sha256.mjs:6"]);
});

test("foundation/T38 [foundation/F23]: ids, one finding per line, Foundation's digest of the line, the last line and exit 0 with findings", () => {
  const d = fresh();
  put(d, "t/two.mjs", "const a = createHash(\"sha256\"), b = createHash('SHA256');\nconst c = 1;\n");
  const { status, json } = run(["--target", "t", "--base", d], scratch);
  assert.equal(status, 0, "findings are not failures");
  assert.equal(json.mode, "scan");
  assert.equal(json.result, "complete");
  assert.equal(json.findings.length, 1, "two matches on one line are one finding");
  const f = json.findings[0];
  assert.equal(f.id, "kaal-foundation/t/two.mjs:1");
  assert.equal(f.digest, hash(Buffer.from("const a = createHash(\"sha256\"), b = createHash('SHA256');", "utf8")));
  assert.ok(Number.isInteger(json.coverage.read) && json.coverage.read >= 1);
});

test("foundation/T39 [foundation/F23]: a target not read, or with no source, is unknown (exit 2); a clean read target is complete and is never called compliant", () => {
  const d = fresh();
  put(d, "empty/readme.txt", "no source here\n");
  put(d, "clean/a.mjs", "export const a = 1;\n");
  const missing = run(["--target", "nowhere"], d);
  assert.deepEqual([missing.status, missing.json.result], [2, "unknown"]);
  assert.ok(missing.json.coverage.unreadable.some((u) => JSON.stringify(u).includes("nowhere")), "the unreadable target is named");
  const none = run(["--target", "empty"], d);
  assert.deepEqual([none.status, none.json.result], [2, "unknown"]);
  const clean = run(["--target", "clean"], d);
  assert.deepEqual([clean.status, clean.json.result, clean.json.findings], [0, "complete", []]);
  assert.match(clean.stdout, /none found within this coverage/i);
  assert.doesNotMatch(clean.stdout, /compliant|verified/i);
});

test("foundation/T40 [foundation/N15]: no target is a usage error; a target added later is found by the same scan bytes; the scan names no repository path", () => {
  const d = fresh();
  const before = hash(readFileSync(SCAN));
  const usage = scan([], d);
  assert.equal(usage.status, 2);
  put(d, "added-later/new-package/x.mjs", CRYPTO);
  const { json } = run(["--target", "added-later"], d);
  assert.equal(json.findings.length, 1);
  assert.equal(hash(readFileSync(SCAN)), before);
  assert.doesNotMatch(readFileSync(SCAN, "utf8"), /packages\/|kaal-(hosting|core|guard|testing|packaging|graph|change)\b/, "scan.mjs must not name another package or a repository path");
});

test("foundation/T41 [foundation/F24]: a finding carries the owner of its nearest ownership.kaal.json, null where none; a directory owned by Foundation is skipped and yields nothing", () => {
  const d = fresh();
  const own = (name) => JSON.stringify({ owner: { kind: "capability", name, id: "x" }, paths: ["."] });
  for (const [dir, name] of [["t/a", "A"], ["t/b", "B"], ["t/f", "Foundation"]]) { put(d, `${dir}/ownership.kaal.json`, own(name)); put(d, `${dir}/x.mjs`, CRYPTO); }
  put(d, "t/none/x.mjs", CRYPTO);
  const { json } = run(["--target", "t"], d);
  const owners = Object.fromEntries(json.findings.map((f) => [f.file, f.owner]));
  assert.deepEqual(owners, { "t/a/x.mjs": "A", "t/b/x.mjs": "B", "t/none/x.mjs": null });
  assert.ok(json.coverage.skipped.some((s) => JSON.stringify(s).includes("t/f") && JSON.stringify(s).includes("owner")), "the owner skip is reported");
});

test("foundation/T42 [foundation/N13]: the scan never runs or changes what it reads", () => {
  const d = fresh();
  put(d, "t/trap.mjs", `import { writeFileSync } from "node:fs";\nwriteFileSync(new URL("./marker", import.meta.url), "ran");\n${CRYPTO}`);
  put(d, "t/trap.cjs", `require("node:fs").writeFileSync(__dirname + "/marker-cjs", "ran");\n`);
  const before = tree(join(d, "t"));
  const { json } = run(["--target", "t"], d);
  assert.equal(json.findings.length, 1);
  assert.deepEqual(tree(join(d, "t")), before);
  assert.ok(!existsSync(join(d, "t", "marker")) && !existsSync(join(d, "t", "marker-cjs")));
});

test("foundation/T43 [foundation/F25, foundation/N15]: the shipped record declares the Boundary Check Applicable, with command, rules, both axes, limits, and where findings and decisions live; it names no role and no repository path", () => {
  const record = join(DIST, "test", "boundary-check", "boundary-check.md");
  assert.ok(existsSync(record), "dist/test/boundary-check/boundary-check.md is not delivered");
  const text = readFileSync(record, "utf8");
  for (const needle of ["Applicable", "scan.mjs --target", "copy", "implementation", "crypto", "package <--> package", "package -> consumer", "audit", "no compliance"])
    assert.ok(text.includes(needle), `the record never mentions ${needle}`);
  assert.doesNotMatch(text, /not applicable/i, "Foundation's Boundary Check is not declared not applicable");
  assert.doesNotMatch(text, /\b(CTO|CPO)\b|packages\//, "the record names no role and no repository path");
});

test("foundation/T44 [foundation/F25]: documents, skill and AGENTS.md name the scan by the scoped package path and say findings are audit and decisions the repository's; verify.json lists scan.mjs and the record", () => {
  const scoped = /node node_modules\/@kaihacksai\/kaal-foundation\/dist\/test\/boundary-check\/scan\.mjs --target\b/;
  const agents = readFileSync(join(REPOSITORY, "AGENTS.md"), "utf8");
  const section = agents.slice(agents.indexOf("## Foundation"), agents.indexOf("\n## ", agents.indexOf("## Foundation") + 1) >>> 0 || undefined);
  for (const [where, text] of [["references/operations.md", readFileSync(join(SOURCE, "references", "operations.md"), "utf8")], ["skill", readFileSync(join(SOURCE, "SKILL.md"), "utf8")], ["AGENTS.md", section]]) {
    assert.match(text, scoped, `${where} must name the scan by the scoped package path`);
    assert.match(text, /audit/i, `${where} must say findings are audit`);
    const invoked = text.split("\n").filter((line) => /\b(npx|npm\s+(exec|x))\b[^\n]*\bscan\.mjs\b/.test(line) && !/\bnever\b/i.test(line));
    assert.deepEqual(invoked, [], `${where}: no invocation through npx or npm exec`);
  }
  const manifest = readFileSync(join(PACKAGE, "04-test", "package-check", "verify.json"), "utf8");
  assert.ok(manifest.includes("test/boundary-check/scan.mjs") && manifest.includes("test/boundary-check/boundary-check.md"), "verify.json lists the scan and the record");
});

test("foundation/T45 [foundation/N14]: scan.mjs imports only node: modules and sha256.mjs; the library is unchanged; the package declares no dependency", () => {
  assert.ok(existsSync(SCAN), "dist/test/boundary-check/scan.mjs is not delivered");
  const text = readFileSync(SCAN, "utf8");
  for (const [, from] of text.matchAll(/(?:^|\n)\s*import[^"'`]*["'`]([^"'`]+)["'`]/g)) assert.ok(from.startsWith("node:") || from.endsWith("/sha256.mjs") || from === "./sha256.mjs", `scan.mjs imports ${from}`);
  assert.doesNotMatch(text, /import\(|require\(/, "scan.mjs imports nothing dynamically");
  assert.equal(hash(readFileSync(join(SOURCE, "scripts", "sha256.mjs"))), MAIN_SHA256_MJS);
  assert.equal(hash(readFileSync(join(SOURCE, "scripts", "sha256.d.ts"))), MAIN_SHA256_DTS);
  assert.equal(pkg.dependencies, undefined);
});
