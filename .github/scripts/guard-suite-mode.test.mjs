import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { after, test } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";
import { suiteMode } from "./guard-suite-mode.mjs";

const scratch = [];
const subject = fileURLToPath(new URL("./guard-suite-mode.mjs", import.meta.url));
const git = (root, ...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const file = (root, path, text = "fixture\n") => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); };
function repo() {
  const root = mkdtempSync(join(tmpdir(), "guard-mode-")); scratch.push(root);
  git(root, "init", "-q"); git(root, "config", "user.name", "fixture"); git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "commit", "-q", "--allow-empty", "-m", "base");
  return { root, base: git(root, "rev-parse", "HEAD") };
}
after(() => scratch.forEach(root => rmSync(root, { recursive: true, force: true })));

test("pre-admission fallback requires actual absence in both candidate and trusted base", () => {
  const { root, base } = repo(); assert.equal(suiteMode(root, base), "baseline");
});
test("candidate with C129 always selects actual orchestration", () => {
  const { root, base } = repo(); file(root, "engineering/guard/suites.mjs");
  assert.equal(suiteMode(root, base), "orchestrated");
});
test("deleting an admitted orchestrator cannot reactivate baseline jobs", () => {
  const { root } = repo(); file(root, "engineering/guard/suites.mjs");
  git(root, "add", "."); git(root, "commit", "-q", "-m", "admit C129");
  const base = git(root, "rev-parse", "HEAD"); rmSync(join(root, "engineering/guard/suites.mjs"));
  assert.throws(() => suiteMode(root, base), /removed admitted.*fallback is forbidden/);
});
test("missing, zero, malformed and unavailable base evidence cannot authorize fallback", () => {
  const { root } = repo();
  for (const base of [undefined, "", "0".repeat(40), "main", "f".repeat(40)])
    assert.throws(() => suiteMode(root, base), /trusted base/);
});
test("an invalid candidate module entry is an error, never a baseline signal", () => {
  const { root, base } = repo(); mkdirSync(join(root, "engineering/guard/suites.mjs"), { recursive: true });
  assert.throws(() => suiteMode(root, base), /not a regular file/);
});
test("a depth-one checkout acquires and checks the exact trusted base", () => {
  const { root: seed, base } = repo(); file(seed, "README.md"); git(seed, "add", "."); git(seed, "commit", "-q", "-m", "candidate");
  const parent = mkdtempSync(join(tmpdir(), "guard-mode-shallow-")); scratch.push(parent);
  const root = join(parent, "clone"); git(parent, "clone", "--depth=1", pathToFileURL(seed).href, root);
  assert.notEqual(spawnSync("git", ["cat-file", "-e", `${base}^{commit}`], { cwd: root }).status, 0);
  assert.equal(suiteMode(root, base), "baseline");
  assert.equal(git(root, "rev-parse", base), base);
});
test("CLI emits a mode only after establishing it, and unknown evidence exits 2", () => {
  const { root, base } = repo(); const output = join(root, "step-output");
  const run = value => spawnSync(process.execPath, [subject], { cwd: root, encoding: "utf8", env: { ...process.env, GUARD_BASE: value, GITHUB_OUTPUT: output } });
  const good = run(base); assert.equal(good.status, 0, good.stderr);
  assert.equal(readFileSync(output, "utf8"), "mode=baseline\n"); assert.match(good.stdout, /evidence unavailable/);
  rmSync(output); const bad = run("invalid"); assert.equal(bad.status, 2); assert.match(bad.stderr, /cannot judge/); assert.equal(existsSync(output), false);
});

for (const eol of ["LF", "CRLF"]) {
test(`workflow (${eol}) skips a pre-admission record gate, but still judges records after producer failure`, () => {
  const source = readFileSync(new URL("../workflows/ci.yml", import.meta.url), "utf8");
  const input = source.replace(/\r?\n/g, eol === "LF" ? "\n" : "\r\n");
  const workflow = input.replace(/\r\n/g, "\n");
  const guard = workflow.slice(workflow.indexOf("\n  guard:\n"), workflow.indexOf("\n  guard-hosts:\n"));
  assert.match(guard, /^    outputs:\n      mode: \$\{\{ steps\.guard-mode\.outputs\.mode \}\}$/m);
  assert.match(guard, /- run: node \.github\/scripts\/guard-suite-mode\.mjs\n        id: guard-mode/);
  const gate = workflow.slice(workflow.indexOf("\n  guard-gate:\n"));
  assert.match(gate, /^    needs: \[guard, guard-hosts\]$/m);
  const condition = /^    if: \$\{\{ (.+) \}\}$/m.exec(gate)?.[1];
  assert.ok(condition, "the gate has no explicit job condition");
  const eligible = (mode, guardResult = "success", hostResult = "success", cancelled = false) => {
    const needs = { guard: { outputs: { mode }, result: guardResult }, "guard-hosts": { result: hostResult } };
    return runInNewContext(condition, { needs, cancelled: () => cancelled, success: () => guardResult === "success" && hostResult === "success" }, { timeout: 500 });
  };
  assert.equal(eligible("baseline"), false, "pre-admission absence became a record-gate execution");
  assert.equal(eligible(undefined), false, "unknown mode became a record-gate execution");
  assert.equal(eligible("orchestrated"), true);
  assert.equal(eligible("orchestrated", "failure"), true, "a failed producer suppressed record validation");
  assert.equal(eligible("orchestrated", "success", "failure"), true, "a missing host record suppressed validation");
  assert.equal(eligible("orchestrated", "success", "success", true), false);
  assert.match(gate, /actions\/download-artifact@/);
  assert.match(gate, /node engineering\/guard\/suites\.mjs --gate/);
  assert.doesNotMatch(gate, /^        if:/m, "an eligible gate conditionally omits its record checks");
  assert.doesNotMatch(gate, /process\.exit\(2\)/, "pre-admission gate deliberately fails");
});
}
