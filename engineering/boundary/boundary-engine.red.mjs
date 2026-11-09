// Engineering RED Cases (PLAN engineering/boundary/PLAN.md): one Boundary Engine, capability-owned Boundary Tests.
// All RED until the DO delivers engineering/boundary/engine.mjs. Every Case asserts behavior through the engine as a
// process, so each fails on a missing engine and can pass only when the contract holds (none passes on existsSync alone).
// Every fixture is built in a temporary directory.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), "engine.mjs");
const dir = mkdtempSync(join(tmpdir(), "boundary-engine-"));
after(() => rmSync(dir, { recursive: true, force: true }));
const put = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); return join(dir, p); };
const sha = (text) => createHash("sha256").update(text).digest("hex");
const def = (provider, tests) => `---\nprovider: ${provider}\ntests:\n${tests}---\nWhy: the provider owns this. An empty list is no compliance.\n`;
const CRYPTO = `  - id: crypto\n    detector: call-with-literal\n    callee: [createHash, digest]\n    literal: [sha256, sha-256]\n    looks-for: the platform asked for SHA-256\n`;
const run = (...args) => {
  const r = spawnSync(process.execPath, [ENGINE, ...args], { encoding: "utf8" });
  const last = r.stdout.trim().split("\n").pop() ?? "";
  return { status: r.status, summary: last.startsWith("kaal-boundary-scan ") ? JSON.parse(last.slice("kaal-boundary-scan ".length)) : null, err: r.stderr };
};

describe("one Boundary Engine, capability-owned Boundary Tests", () => {
  it("T1 (RED until the DO) [R1]: the engine finds the call's line in a target, exit 0 with a finding", () => {
    const tests = put("t1/tests.md", def("demo", CRYPTO));
    put("t1/t/a.mjs", "x\nconst h = createHash(\"sha256\");\n");
    const r = run("--tests", tests, "--target", join(dir, "t1/t"), "--base", join(dir, "t1"));
    assert.equal(r.status, 0);
    assert.equal(r.summary.result, "complete");
    assert.deepEqual(r.summary.findings.map((f) => [f.id, f.rule, f.line]), [["demo/t/a.mjs:2", "crypto", 2]]);
  });
  it("T2 (RED until the DO) [R2]: a definition that names a target or a role, or has an unknown parameter, is refused", () => {
    const base = def("demo", CRYPTO);
    for (const [name, text] of [
      ["target", base.replace("provider: demo", "provider: demo\ntargets: [packages/kaal-hosting]")],
      ["role", base.replace("provider: demo", "provider: demo\ndecider: CTO")],
      ["parameter", base.replace("    looks-for", "    colour: red\n    looks-for")],
      ["missing", base.replace("    literal: [sha256, sha-256]\n", "")],
      ["type", base.replace("callee: [createHash, digest]", "callee: createHash")],
    ]) assert.equal(run("--tests", put(`t2/${name}.md`, text), "--target", dir).status, 2, name);
  });
  it("T3 (RED until the DO) [R3]: a missing target is unknown, exit 2, and the last line is kaal-boundary-scan", () => {
    const r = run("--tests", put("t3/tests.md", def("demo", CRYPTO)), "--target", join(dir, "nope"));
    assert.equal(r.status, 2);
    assert.equal(r.summary?.result, "unknown");
  });
  it("T4 (RED until the DO) [R3]: a directory owned by the provider is skipped and reported, with no finding", () => {
    const tests = put("t4/tests.md", def("demo", CRYPTO));
    put("t4/own/ownership.kaal.json", JSON.stringify({ owner: { kind: "capability", name: "demo", id: "x" }, paths: ["own/"] }));
    put("t4/own/a.mjs", "createHash(\"sha256\")\n");
    const r = run("--tests", tests, "--target", join(dir, "t4/own"), "--base", join(dir, "t4"));
    assert.equal(r.summary?.findings.length, 0);
    assert.ok(r.summary.coverage.skipped.some((s) => s.reason === "owner"));
  });
  it("T5 (RED until the DO) [R1, R8]: the engine only reads: the target tree is identical after a run, and the engine imports only node: modules and yaml", () => {
    const tests = put("t5/tests.md", def("demo", CRYPTO));
    put("t5/ro/a.mjs", "createHash(\"sha256\")\n");
    const snap = () => readdirSync(join(dir, "t5/ro"), { recursive: true }).sort().map((f) => [f, statSync(join(dir, "t5/ro", f)).isFile() ? readFileSync(join(dir, "t5/ro", f)).toString("hex") : "dir"]);
    const before = snap();
    const r = run("--tests", tests, "--target", join(dir, "t5/ro"), "--base", join(dir, "t5"));
    assert.equal(r.status, 0);
    assert.deepEqual(snap(), before);
    const src = readFileSync(ENGINE, "utf8");
    const imports = [...src.matchAll(/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g)].map((m) => m[1]);
    assert.ok(imports.length > 0 && imports.every((m) => m.startsWith("node:") || m === "yaml" || m.startsWith("./")), `imports: ${imports}`);
    assert.doesNotMatch(src, /\b(writeFile|appendFile|rmSync|unlink|mkdir|rename|spawn|exec|fetch)\w*\s*\(/);
  });
  it("T6 (RED until the DO) [R2, R4]: file-identity, token-sequence and call-with-literal find a byte copy, a bounded constant sequence and a crypto call, and not their near misses", () => {
    const ref = "export const ref = 1;\n";
    put("t6/def/ref/lib.mjs", ref);
    const tests = put("t6/def/tests.md", def("demo",
      `  - id: copy\n    detector: file-identity\n    equals: [ref/lib.mjs]\n    looks-for: a file whose bytes equal the provider's library\n` +
      `  - id: implementation\n    detector: token-sequence\n    tokens: ["0x428a2f98", "0x71374491"]\n    window: 3\n    looks-for: the constants written out\n` + CRYPTO));
    put("t6/t/copy.mjs", ref);
    put("t6/t/noncopy.mjs", ref + "// x\n");
    put("t6/t/impl-near.mjs", "a\nconst K = [0x428a2f98,\n  0x71374491];\n");
    put("t6/t/impl-far.mjs", "a\nconst K = [0x428a2f98,\n1,\n2,\n3,\n0x71374491];\n");
    put("t6/t/impl-same.mjs", "const K = [0x428a2f98, 0x71374491];\nconst x = 0x428a2f98;\n");
    put("t6/t/crypto.mjs", "x\ncreateHash( \"sha256\" );\ny\nh.digest(\"SHA-256\")\ncreateHash(\"md5\")\ncreateHash(algorithm)\n");
    const r = run("--tests", tests, "--target", join(dir, "t6/t"), "--base", join(dir, "t6"));
    assert.equal(r.status, 0);
    assert.equal(r.summary.result, "complete");
    assert.equal(r.summary.coverage.read, 6);
    assert.deepEqual(r.summary.findings.map((f) => [f.id, f.rule]), [
      ["demo/t/copy.mjs:1", "copy"],
      ["demo/t/crypto.mjs:2", "crypto"],
      ["demo/t/crypto.mjs:4", "crypto"],
      ["demo/t/impl-near.mjs:2", "implementation"],
      ["demo/t/impl-same.mjs:1", "implementation"],
    ]);
    const lost = run("--tests", put("t6/lost/tests.md", readFileSync(tests, "utf8")), "--target", join(dir, "t6/t"), "--base", join(dir, "t6"));
    assert.equal(lost.status, 2, "a file-identity reference that cannot be read makes the result unknown");
    assert.equal(lost.summary?.result, "unknown");
  });
  it("T7 (RED until the DO) [R7]: a finding has exactly id, rule, file, line, digest and owner; the digest is the line's SHA-256; a usage error exits 2; the exit is never 1", () => {
    const tests = put("t7/tests.md", def("demo", CRYPTO));
    put("t7/t/a.mjs", "x\ncreateHash(\"sha256\")\n");
    const r = run("--tests", tests, "--target", join(dir, "t7/t"), "--base", join(dir, "t7"));
    assert.equal(r.status, 0);
    const f = r.summary.findings[0];
    assert.deepEqual(Object.keys(f).sort(), ["digest", "file", "id", "line", "owner", "rule"]);
    assert.equal(f.digest, sha("createHash(\"sha256\")"));
    assert.equal(run("--target", join(dir, "t7/t")).status, 2);
    assert.notEqual(run("--tests", tests).status, 1);
  });
  it("T8 (RED until the DO) [R2]: a capability changes its own Boundary Tests without an Engineering code change", () => {
    const engineBefore = sha(readFileSync(ENGINE));
    put("t8/t/a.mjs", "createHash(\"sha256\")\nconst m = \"md5\";\nopen(\"alpha\", \"beta\");\n");
    const find = (file) => run("--tests", file, "--target", join(dir, "t8/t"), "--base", join(dir, "t8")).summary.findings.map((f) => f.id);
    const one = find(put("t8/one.md", def("demo", CRYPTO)));
    const changed = find(put("t8/two.md", def("demo", CRYPTO.replace("[sha256, sha-256]", "[md5]").replace("[createHash, digest]", "[createHash, digest, open]"))));
    const other = find(put("t8/other.md", def("other", `  - id: pair\n    detector: token-sequence\n    tokens: [alpha, beta]\n    window: 0\n    looks-for: two words together\n`)));
    assert.deepEqual(one, ["demo/t/a.mjs:1"]);
    assert.notDeepEqual(changed, one);
    assert.deepEqual(other, ["other/t/a.mjs:3"]);
    assert.equal(sha(readFileSync(ENGINE)), engineBefore);
  });
  it("T9 (RED until the DO) [R2]: a new generic detector needs an Engineering Change: a definition naming an unknown detector, or carrying code or a regular expression, is refused and runs nothing", () => {
    put("t9/t/a.mjs", "createHash(\"sha256\")\n");
    const marker = join(dir, "t9/ran.txt");
    put("t9/hook.mjs", `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(marker)}, "ran");\n`);
    for (const [name, tests] of [
      ["detector", `  - id: x\n    detector: semantic-clone\n    looks-for: anything\n`],
      ["script", CRYPTO + `    script: ../hook.mjs\n`],
      ["regex", CRYPTO + `    pattern: 'createHash'\n`],
    ]) {
      const r = run("--tests", put(`t9/${name}.md`, def("demo", tests)), "--target", join(dir, "t9/t"), "--base", join(dir, "t9"));
      assert.equal(r.status, 2, name);
    }
    assert.throws(() => readFileSync(marker), "nothing from a definition is executed");
  });
});
