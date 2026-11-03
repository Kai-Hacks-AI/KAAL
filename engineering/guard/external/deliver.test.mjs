// Inner tests of Guard's External delivery tooling: what it delivers, what it refuses, and how the
// delivered runner judges. The outer test is T3 (engineering/guard/acceptance/external.test.mjs).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { render } from "./deliver.mjs";

const SKILL = ".agents/skills/kaal-guard/SKILL.md";

const DELIVER = resolve(dirname(fileURLToPath(import.meta.url)), "deliver.mjs");
const POSIX = process.platform !== "win32";

/** A fresh target repository with these files committed on main. */
function target(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "guard-deliver-"));
  const git = (...a) => spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...a], { cwd: dir, encoding: "utf8" });
  git("init", "-q", "-b", "main");
  for (const [p, c] of Object.entries({ "README.md": "target\n", ...files })) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), c);
  }
  git("add", "-A");
  git("commit", "-q", "-m", "target");
  return { dir, git };
}

function deliver(dir, checks, branch = "guard", ...more) {
  const file = join(dir, "..", `${branch}-checks.json`);
  writeFileSync(file, JSON.stringify(checks));
  const r = spawnSync(process.execPath, [DELIVER, "--target", dir, "--checks", file, "--branch", branch, ...more], { encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
  return { status: r.status, output: `${r.stdout}${r.stderr}` };
}

describe("render", () => {
  it("delivers no workflow when no check runs in CI, and lists every check in the runner and the docs", () => {
    const files = render({ fast: { command: "npm test", runs: ["local"] } }, mkdtempSync(join(tmpdir(), "guard-render-")));
    assert.deepEqual(Object.keys(files).sort(), [".agents/skills/kaal-guard/SKILL.md", ".githooks/guard.sh", ".githooks/pre-push", "GUARD.md"]);
    assert.match(files[".githooks/guard.sh"], /^LOCAL="fast"$/m);
    assert.match(files[".githooks/guard.sh"], /^ {4}fast\) npm test ;;$/m);
    assert.match(files["GUARD.md"], /`fast`: `npm test`, runs in the hook/);
  });

  it("lists the further deployments and pointers it is given in the docs, and delivers each deployment", () => {
    const agents = { write: [{ path: ".claude/skills/kaal-guard/SKILL.md", text: "copy\n" }], pointers: [{ provider: "other", skill: "kaal-guard", target: SKILL }] };
    const files = render({ fast: { command: "npm test", runs: ["local"] } }, mkdtempSync(join(tmpdir(), "guard-render-")), agents);
    assert.equal(files[".claude/skills/kaal-guard/SKILL.md"], "copy\n");
    assert.match(files["GUARD.md"], /^- `\.claude\/skills\/kaal-guard\/`: a copy of the Skill/m);
    assert.match(files["GUARD.md"], /^- other: add a line to its instruction file naming `\.agents\/skills\/kaal-guard\/SKILL\.md`\.$/m);
    assert.doesNotMatch(render({ fast: { command: "npm test", runs: ["local"] } }, mkdtempSync(join(tmpdir(), "guard-render-")))["GUARD.md"], /For the agents/);
  });

  it("sets up Node only for a target with a package.json, and installs locked dependencies only with a lockfile", () => {
    const dir = mkdtempSync(join(tmpdir(), "guard-render-"));
    const ci = { unit: { command: "npm test", runs: ["ci"] } };
    assert.doesNotMatch(render(ci, dir)[".github/workflows/guard.yml"], /setup-node|npm ci/);
    writeFileSync(join(dir, "package.json"), "{}");
    assert.match(render(ci, dir)[".github/workflows/guard.yml"], /setup-node/);
    assert.doesNotMatch(render(ci, dir)[".github/workflows/guard.yml"], /npm ci/);
    writeFileSync(join(dir, "package-lock.json"), "{}");
    assert.match(render(ci, dir)[".github/workflows/guard.yml"], /- run: npm ci/);
  });
});

describe("deliver", () => {
  it("keeps a hook the target already has, and prints the line to add", () => {
    const t = target({ ".githooks/pre-push": "#!/bin/sh\necho mine\n" });
    const r = deliver(t.dir, { unit: { command: "true", runs: ["local"] } });
    assert.equal(r.status, 0, r.output);
    assert.match(r.output, /kept \.githooks\/pre-push/);
    assert.match(r.output, /sh \.githooks\/guard\.sh pre-push "\$@" \|\| exit 1/);
    assert.equal(t.git("show", "guard:.githooks/pre-push").stdout, "#!/bin/sh\necho mine\n");
  });

  it("keeps a Skill the target already has at the canonical location, and reports it", () => {
    const t = target({ [SKILL]: "mine\n" });
    const r = deliver(t.dir, { unit: { command: "true", runs: ["local"] } });
    assert.equal(r.status, 0, r.output);
    assert.match(r.output, /kept \.agents\/skills\/kaal-guard\/SKILL\.md/);
    assert.equal(t.git("show", `guard:${SKILL}`).stdout, "mine\n");
  });

  it("refuses --agents without providers, writing nothing", () => {
    const t = target();
    const agents = join(t.dir, "..", "agents.json");
    writeFileSync(agents, JSON.stringify({ providers: [] }));
    const before = t.git("rev-parse", "HEAD").stdout;
    const r = deliver(t.dir, { unit: { command: "true", runs: ["local"] } }, "guard", "--agents", agents);
    assert.equal(r.status, 2, r.output);
    assert.match(r.output, /declares no providers/);
    assert.equal(t.git("rev-parse", "HEAD").stdout, before);
    assert.equal(t.git("branch", "--list", "guard").stdout, "");
  });

  it("refuses, writing nothing, when the target has a runner of its own, uncommitted changes or the branch already", () => {
    for (const [files, prepare, why] of [
      [{ ".githooks/guard.sh": "mine\n" }, () => {}, /\.githooks\/guard\.sh exists/],
      [{}, (t) => writeFileSync(join(t.dir, "dirty.txt"), "x"), /uncommitted changes/],
      [{}, (t) => t.git("branch", "guard"), /branch guard exists/],
    ]) {
      const t = target(files);
      prepare(t);
      const before = t.git("rev-parse", "HEAD").stdout;
      const r = deliver(t.dir, { unit: { command: "true", runs: ["ci"] } });
      assert.equal(r.status, 2, r.output);
      assert.match(r.output, why);
      assert.equal(t.git("rev-parse", "HEAD").stdout, before);
    }
  });

  it("refuses a check name that is not a plain word, and a command over several lines", () => {
    const t = target();
    assert.match(deliver(t.dir, { "a b": { command: "true", runs: ["ci"] } }).output, /not a plain word/);
    assert.match(deliver(t.dir, { a: { command: "true\nfalse", runs: ["ci"] } }).output, /no one-line command/);
  });
});

describe("the delivered runner", { skip: !POSIX }, () => {
  it("gives each exit status its verdict, and blocks on fail and cannot judge", () => {
    const t = target();
    const checks = Object.fromEntries([0, 1, 2, 3, 7].map((s) => [`s${s}`, { command: `sh -c "exit ${s}"`, runs: ["local"] }]));
    assert.equal(deliver(t.dir, checks).status, 0);
    t.git("checkout", "-q", "guard");
    const run = (...a) => spawnSync("sh", [".githooks/guard.sh", ...a], { cwd: t.dir, encoding: "utf8" });
    const local = run("--local");
    assert.equal(local.status, 1);
    for (const line of ["pass: s0: exit status 0", "fail: s1: exit status 1", "cannot judge: s2: exit status 2", "not applicable: s3: exit status 3", "cannot judge: s7: exit status 7 is not a verdict"]) {
      assert.ok(local.stdout.includes(line), `missing "${line}" in:\n${local.stdout}`);
    }
    assert.ok(local.stdout.trimEnd().endsWith(`guard: to resolve a fail or cannot judge, read the Skill at ${SKILL}`), local.stdout);
    const passed = run("--check", "s3");
    assert.equal(passed.status, 0);
    assert.doesNotMatch(passed.stdout, /read the Skill/);
    assert.equal(run("--check", "unknown").status, 1);
  });

  it("leaves GUARD_CHANGED unset in the hook when Git cannot compute the changed paths", () => {
    const t = target();
    assert.equal(deliver(t.dir, { seen: { command: "sh -c 'echo \"changed=${GUARD_CHANGED-unset} base=${GUARD_BASE-unset}\"'", runs: ["local"] } }).status, 0);
    t.git("checkout", "-q", "guard");
    const head = t.git("rev-parse", "HEAD").stdout.trim();
    t.git("checkout", "-q", "--orphan", "unrelated");
    t.git("commit", "-q", "--allow-empty", "-m", "unrelated");
    t.git("update-ref", "refs/remotes/origin/main", "HEAD");
    t.git("checkout", "-q", "guard");
    const r = spawnSync("sh", [".githooks/pre-push", "origin"], { cwd: t.dir, encoding: "utf8", input: `refs/heads/guard ${head} refs/heads/guard ${"0".repeat(40)}\n` });
    assert.match(r.stderr, /cannot be computed; GUARD_CHANGED is not set/);
    assert.match(r.stderr, /changed=unset base=[0-9a-f]{40}/);
  });
});

it("delivers nothing that names KAAL but the Skill's own name and canonical path", () => {
  const files = render({ unit: { command: "npm test", runs: ["local", "ci"] } }, mkdtempSync(join(tmpdir(), "guard-render-")));
  const own = (text) => text.replaceAll(".agents/skills/kaal-guard", "").replace(/^name: kaal-guard$/m, "");
  for (const [path, text] of Object.entries(files)) assert.doesNotMatch(own(text), /kaal/i, path);
  assert.doesNotMatch(files[SKILL], /\bnpm\b|\bnpx\b/, "the Skill names npm");
});
