// Engineering RED Cases (PLAN engineering/boundary/PLAN.md): one boundary engine, providers ship rules only.
// All RED until the DO delivers engineering/boundary/engine.mjs. Every Case asserts behavior through the engine as a process,
// so each fails on a missing engine and can pass only when the contract holds (no Case passes on existsSync alone).
// Every fixture is built in a temporary directory. The Cases run the engine as a process and read its last line.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), "engine.mjs");
const dir = mkdtempSync(join(tmpdir(), "boundary-engine-"));
after(() => rmSync(dir, { recursive: true, force: true }));
const put = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); return join(dir, p); };
const RULES = `---\nprovider: demo\nrules:\n  - id: crypto\n    kind: line\n    patterns: ['createHash\\(\\s*"sha256"']\n    flags: i\n    looks-for: the platform asked for SHA-256\n---\nWhy: one SHA-256. An empty list is no compliance.\n`;
const run = (...args) => {
  const r = spawnSync(process.execPath, [ENGINE, ...args], { encoding: "utf8" });
  const last = r.stdout.trim().split("\n").pop() ?? "";
  return { status: r.status, summary: last.startsWith("kaal-boundary-scan ") ? JSON.parse(last.slice("kaal-boundary-scan ".length)) : null, err: r.stderr };
};

describe("one boundary engine", () => {
  it("T1 (RED until the DO) [R1]: the engine exists and finds the rule's line in a target, exit 0 with a finding", () => {
    assert.ok(existsSync(ENGINE), "engineering/boundary/engine.mjs is not delivered");
    const rules = put("rules.md", RULES), t = put("t/a.mjs", "x\nconst h = createHash(\"sha256\");\n");
    const r = run("--rules", rules, "--target", join(dir, "t"), "--base", dir);
    assert.equal(r.status, 0);
    assert.equal(r.summary.result, "complete");
    assert.deepEqual(r.summary.findings.map((f) => [f.id, f.rule, f.line]), [["demo/t/a.mjs:2", "crypto", 2]]);
  });
  it("T2 (RED until the DO) [R2]: a rules file that names a target path or a role is refused", () => {
    const bad = put("bad.md", RULES.replace("provider: demo", "provider: demo\ntargets: [packages/kaal-hosting]"));
    assert.equal(run("--rules", bad, "--target", dir).status, 2);
    const kind = put("kind.md", RULES.replace("kind: line", "kind: whatever"));
    assert.equal(run("--rules", kind, "--target", dir).status, 2);
  });
  it("T3 (RED until the DO) [R3]: a finding carries the line's digest and the owner, the last line is kaal-boundary-scan, and a missing target is unknown, exit 2", () => {
    const rules = put("rules.md", RULES);
    const miss = run("--rules", rules, "--target", join(dir, "nope"));
    assert.equal(miss.status, 2);
    assert.equal(miss.summary?.result, "unknown");
  });
  it("T4 (RED until the DO) [R3]: a directory owned by the rules' provider is skipped and reported, with no finding", () => {
    const rules = put("rules.md", RULES);
    put("own/ownership.kaal.json", JSON.stringify({ owner: { kind: "capability", name: "demo", id: "x" }, paths: ["own/"] }));
    put("own/a.mjs", "createHash(\"sha256\")\n");
    const r = run("--rules", rules, "--target", join(dir, "own"), "--base", dir);
    assert.equal(r.summary?.findings.length, 0);
    assert.ok(r.summary.coverage.skipped.some((s) => s.reason === "owner"));
  });
  it("T5 (RED until the DO) [R1, R8]: the engine only reads: the target tree is identical after a run, and the engine imports only node: modules and yaml", () => {
    const rules = put("rules.md", RULES);
    put("ro/a.mjs", "createHash(\"sha256\")\n");
    const snap = () => readdirSync(join(dir, "ro"), { recursive: true }).sort().map((f) => [f, statSync(join(dir, "ro", f)).isFile() ? readFileSync(join(dir, "ro", f)).toString("hex") : "dir"]);
    const before = snap();
    const r = run("--rules", rules, "--target", join(dir, "ro"), "--base", dir);
    assert.equal(r.status, 0);
    assert.deepEqual(snap(), before);
    const src = readFileSync(ENGINE, "utf8");
    const imports = [...src.matchAll(/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g)].map((m) => m[1]);
    assert.ok(imports.length > 0 && imports.every((m) => m.startsWith("node:") || m === "yaml" || m.startsWith("./")), `imports: ${imports}`);
    assert.doesNotMatch(src, /\b(writeFile|appendFile|rmSync|unlink|mkdir|rename|spawn|exec|fetch)\w*\s*\(/);
  });
  it("T6 (RED until the DO) [R2, R4]: file-bytes, sequence and line rules find a byte copy, a bounded constant sequence and a crypto call, and not their near misses", () => {
    const ref = "export const ref = 1;\n";
    put("rules6/ref/lib.mjs", ref);
    const rules = put("rules6/rules.md", `---\nprovider: demo\nrules:\n  - id: copy\n    kind: file-bytes\n    equals: [ref/lib.mjs]\n    looks-for: a file whose bytes equal the provider's library\n  - id: implementation\n    kind: sequence\n    steps: ['0x428a2f98', '0x71374491']\n    within: 3\n    flags: i\n    looks-for: the constants written out\n  - id: crypto\n    kind: line\n    patterns: ['createHash\\\\(\\\\s*(["\'\`])sha-?256\\\\1', 'digest\\\\(\\\\s*(["\'\`])sha-?256\\\\1']\n    flags: i\n    looks-for: the platform asked for SHA-256\n---\nWhy: the provider owns this. An empty list is no compliance.\n`);
    put("t6/copy.mjs", ref);
    put("t6/noncopy.mjs", ref + "// x\n");
    put("t6/impl-near.mjs", "a\nconst K = [0x428a2f98,\n  0x71374491];\n");
    put("t6/impl-far.mjs", "a\nconst K = [0x428a2f98,\n1,\n2,\n3,\n0x71374491];\n");
    put("t6/impl-same.mjs", "const K = [0x428a2f98, 0x71374491];\nconst x = 0x428a2f98;\n");
    put("t6/crypto.mjs", "x\ncreateHash( \"sha256\" );\ny\nh.digest(\"SHA-256\")\ncreateHash(\"md5\")\n");
    const r = run("--rules", rules, "--target", join(dir, "t6"), "--base", dir);
    assert.equal(r.status, 0);
    assert.equal(r.summary.result, "complete");
    assert.equal(r.summary.coverage.read, 6);
    assert.deepEqual(r.summary.findings.map((f) => [f.id, f.rule]), [
      ["demo/t6/copy.mjs:1", "copy"],
      ["demo/t6/crypto.mjs:2", "crypto"],
      ["demo/t6/crypto.mjs:4", "crypto"],
      ["demo/t6/impl-near.mjs:2", "implementation"],
      ["demo/t6/impl-same.mjs:1", "implementation"],
    ]);
    const unreadable = run("--rules", put("rules6b/rules.md", readFileSync(rules, "utf8")), "--target", join(dir, "t6"), "--base", dir);
    assert.equal(unreadable.status, 2, "a file-bytes reference that cannot be read makes the result unknown");
    assert.equal(unreadable.summary?.result, "unknown");
  });
  it("T7 (RED until the DO) [R7]: a finding has exactly id, rule, file, line, digest and owner; the digest is the line's SHA-256; a usage error exits 2; the exit is never 1", () => {
    const rules = put("rules.md", RULES);
    put("t7/a.mjs", "x\ncreateHash(\"sha256\")\n");
    const r = run("--rules", rules, "--target", join(dir, "t7"), "--base", dir);
    assert.equal(r.status, 0);
    const f = r.summary.findings[0];
    assert.deepEqual(Object.keys(f).sort(), ["digest", "file", "id", "line", "owner", "rule"]);
    assert.equal(f.digest, createHash("sha256").update("createHash(\"sha256\")").digest("hex"));
    const usage = run("--target", join(dir, "t7"));
    assert.equal(usage.status, 2);
    assert.notEqual(run("--rules", rules).status, 1);
  });
});
