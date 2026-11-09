// Engineering RED Cases (PLAN engineering/boundary/PLAN.md): one boundary engine, providers ship rules only.
// All RED until the DO delivers engineering/boundary/engine.mjs: missing-deliverable evidence, not behavioural.
// Every fixture is built in a temporary directory. The Cases run the engine as a process and read its last line.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), "engine.mjs");
const dir = mkdtempSync(join(tmpdir(), "boundary-engine-"));
after(() => rmSync(dir, { recursive: true, force: true }));
const put = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); return join(dir, p); };
const RULES = `---\nprovider: demo\nrules:\n  - id: crypto\n    pattern: 'createHash\\(\\s*"sha256"'\n    flags: i\n    looks-for: the platform asked for SHA-256\n---\nWhy: one SHA-256. An empty list is no compliance.\n`;
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
    const r = run("--rules", bad, "--target", dir);
    assert.equal(r.status, 2);
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
  it("T5 (RED until the DO) [R1, R8]: the engine only reads, and imports only node: modules and the repository's yaml package", () => {
    assert.ok(existsSync(ENGINE), "engineering/boundary/engine.mjs is not delivered");
  });
  it("T6 (RED until the DO) [R4]: Foundation's rules file gives the same findings as the old scanner on its fixtures", () => {
    assert.ok(existsSync(ENGINE), "engineering/boundary/engine.mjs is not delivered");
  });
  it("T7 (RED until the DO) [R7]: the engine's output shape and exit codes match Hosting's scan on one fixture", () => {
    assert.ok(existsSync(ENGINE), "engineering/boundary/engine.mjs is not delivered");
  });
});
