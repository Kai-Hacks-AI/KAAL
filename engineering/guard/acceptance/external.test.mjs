// Guard outer acceptance, Engineering part: External. Intent validation I3 [O6], with N5 and G8 verified
// for a target and A10 conformance.
// KAAL Engineering delivers Guard naked into a fresh target as one Change. Planned in PLAN; DO and
// CHECK do not change it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DELIVER = resolve(HERE, "..", "external", "deliver.mjs");

function run(cwd, file, args, env) {
  const r = spawnSync(file, args, { cwd, env: { ...process.env, ...env }, encoding: "utf8" });
  return { status: r.status, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/** A fresh target with a bare remote, its own checks, and a workflow of its own. */
function target() {
  const root = mkdtempSync(join(tmpdir(), "guard-external-"));
  const dir = join(root, "repo");
  const home = join(root, "home");
  mkdirSync(dir);
  mkdirSync(home);
  const env = { HOME: home, USERPROFILE: home, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(home, ".gitconfig") };
  const git = (...a) => run(dir, "git", a, env);
  const write = (p, c) => (mkdirSync(dirname(join(dir, p)), { recursive: true }), writeFileSync(join(dir, p), c));
  run(root, "git", ["init", "-q", "--bare", join(root, "remote.git")], env);
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Target");
  git("config", "user.email", "target@example.invalid");
  git("config", "commit.gpgsign", "false");
  write("package.json", JSON.stringify({ name: "target", version: "1.0.0", private: true, scripts: { test: "node checks/unit.mjs" } }, null, 2) + "\n");
  write("checks/unit.mjs", "process.exit(Number(process.env.UNIT_STATUS ?? 0));\n");
  write(".github/workflows/build.yml", "name: Build\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo build\n");
  git("add", "-A");
  git("commit", "-q", "-m", "target");
  git("remote", "add", "origin", join(root, "remote.git"));
  git("push", "-q", "-u", "origin", "main");
  return { dir, env, git, write, read: (p) => readFileSync(join(dir, p), "utf8") };
}

describe("I3 [O6] External delivers Guard naked", () => {
  it("I3 [O6], N5, G8, A10: delivers one Change with working hooks and CI and local docs, and leaves nothing from KAAL", () => {
    assert.ok(existsSync(DELIVER), "blocked before behavioural assertion: there is no External delivery tooling (engineering/guard/external/deliver.mjs)");
    const t = target();
    const build = t.read(".github/workflows/build.yml");
    const before = t.read("package.json");
    const checks = join(t.dir, "..", "checks.json");
    writeFileSync(checks, JSON.stringify({ unit: { command: "npm test", runs: ["local", "ci"] } }));

    const d = run(HERE, process.execPath, [DELIVER, "--target", t.dir, "--checks", checks, "--branch", "guard"], t.env);
    assert.equal(d.status, 0, d.output);

    // One Change: a branch with one commit on main.
    assert.equal(t.git("rev-list", "--count", "main..guard").output.trim(), "1");
    const changed = t.git("diff", "--name-only", "main", "guard").output.trim().split("\n").filter(Boolean);
    assert.ok(changed.length > 0 && changed.length <= 5, `N5: the delivery is not a handful of files: ${changed}`);
    assert.ok(changed.includes(".githooks/pre-push"), "no hook delivered");
    assert.ok(changed.some((p) => p.startsWith(".github/workflows/")), "no CI delivered");
    assert.ok(changed.some((p) => /\.md$/i.test(p)), "no local docs delivered");

    // Naked: nothing from KAAL, and nothing of the target's overwritten.
    t.git("checkout", "-q", "guard");
    for (const p of changed) assert.doesNotMatch(t.read(p), /kaal/i, `${p} mentions KAAL`);
    assert.equal(t.read("package.json"), before, "the delivery changed the target's dependencies");
    assert.equal(t.read(".github/workflows/build.yml"), build, "the delivery overwrote the target's workflow");
    assert.ok(!existsSync(join(t.dir, "node_modules")), "the delivery installed packages");

    // Working: the delivered hook blocks a failing check and lets a passing one through.
    t.git("config", "core.hooksPath", ".githooks");
    t.write("note.txt", "x\n");
    t.git("add", "-A");
    t.git("commit", "-q", "-m", "note");
    assert.notEqual(run(t.dir, "git", ["push", "origin", "guard"], { ...t.env, UNIT_STATUS: "1" }).status, 0, "the delivered hook let a failing check through");
    assert.equal(run(t.dir, "git", ["push", "origin", "guard"], { ...t.env, UNIT_STATUS: "0" }).status, 0, "the delivered hook blocked a passing check");
  });
});
