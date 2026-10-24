// The Guard lane's selection in each state KAAL can be in, and its refusals, in disposable
// repositories: the established suite, the planned suite, and every absent, incomplete or
// contradictory state, which must fail with a diagnostic and never fall back. Node built-ins only,
// so the Guard jobs run it on every supported OS before any install.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { BOUNDARY, Refusal, UNIT, select } from "./guard.mjs";

const LANE = join(dirname(fileURLToPath(import.meta.url)), "guard.mjs");
const [PACKAGE, KAAL] = BOUNDARY;
const PASS = `import { test } from "node:test";\ntest("passes", () => {});\n`;
const FAIL = `import { test } from "node:test";\ntest("fails", () => { throw new Error("red"); });\n`;

/** A disposable repository holding these files, each `path: content`. */
function repo(files) {
  const root = mkdtempSync(join(tmpdir(), "kaal-guard-lane-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

/** The established suite as today's tree has it, with each test passing unless replaced. */
const established = (over = {}) => ({
  [`${UNIT}/runner.test.mjs`]: PASS,
  [`${PACKAGE}/harness.mjs`]: "export {};\n",
  [`${PACKAGE}/intent.test.mjs`]: PASS,
  [`${PACKAGE}/requirements.test.mjs`]: PASS,
  [`${KAAL}/kaal.test.mjs`]: PASS,
  [`${KAAL}/consumer/consumer.test.mjs`]: FAIL,
  ...over,
});

/** A complete planned suite beside it. */
const plan = (over = {}) => ({
  [`${PACKAGE}/plan/harness.mjs`]: "export {};\n",
  [`${PACKAGE}/plan/intent.test.mjs`]: PASS,
  [`${PACKAGE}/plan/requirements.test.mjs`]: PASS,
  [`${PACKAGE}/plan/new.test.mjs`]: PASS,
  [`${KAAL}/plan/kaal.test.mjs`]: PASS,
  [`${KAAL}/plan/consumer/consumer.test.mjs`]: FAIL,
  ...over,
});

const LEGACY = { "guard.json": "{}\n" };
const CONFIG = { ".kaal/config/guard/unit.md": "---\ntype: Guard/Check\n---\n" };

/** Runs the lane's command against `root`. */
const lane = (root, ...args) => spawnSync(process.execPath, [LANE, "--root", root, ...args], { encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "" } });

/** Asserts that selection refuses with a message matching `why`, and that the command exits 2 with it, running nothing. */
function refuses(root, why, ...args) {
  assert.throws(() => select(root, { planned: args.includes("--planned") }), (e) => e instanceof Refusal && why.test(e.message) && e.todo.length > 0);
  const r = lane(root, ...args);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, why);
  assert.match(r.stderr, /\n {2}do: \S/);
  assert.doesNotMatch(r.stdout, /# (pass|fail) /, "a refused lane ran tests");
}

describe("the Guard lane with KAAL on guard.json", () => {
  it("runs the established suite: kaal-guard's own tests and each boundary directory's own tests", () => {
    const root = repo({ ...LEGACY, ...established() });
    assert.deepEqual(select(root), {
      suite: "established",
      files: [`${UNIT}/runner.test.mjs`, `${PACKAGE}/intent.test.mjs`, `${PACKAGE}/requirements.test.mjs`, `${KAAL}/kaal.test.mjs`],
    });
  });

  it("ignores a planned suite beside it, which stays out of the gate until KAAL declares .kaal/config/guard/", () => {
    const root = repo({ ...LEGACY, ...established(), ...plan({ [`${PACKAGE}/plan/new.test.mjs`]: FAIL }) });
    assert.equal(select(root).suite, "established");
    const r = lane(root);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /guard lane: the established suite passed/);
  });

  it("fails when an established test fails", () => {
    const r = lane(repo({ ...LEGACY, ...established({ [`${KAAL}/kaal.test.mjs`]: FAIL }) }));
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /guard lane: the established suite failed/);
  });

  it("refuses an established suite with no test", () => {
    refuses(repo({ ...LEGACY, [`${UNIT}/runner.test.mjs`]: PASS }), /the established suite holds no test/);
  });

  it("runs the planned suite when asked with --planned, for PLAN evidence", () => {
    const root = repo({ ...LEGACY, ...established(), ...plan({ [`${PACKAGE}/plan/new.test.mjs`]: FAIL }) });
    assert.equal(select(root, { planned: true }).suite, "planned");
    const r = lane(root, "--planned");
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /guard lane: the planned suite failed/);
  });
});

describe("the Guard lane with KAAL on .kaal/config/guard/", () => {
  it("runs the planned suite: kaal-guard's own tests and each plan/ directory's own tests", () => {
    const root = repo({ ...CONFIG, ...established({ [`${KAAL}/kaal.test.mjs`]: FAIL }), ...plan() });
    assert.deepEqual(select(root), {
      suite: "planned",
      files: [`${UNIT}/runner.test.mjs`, `${PACKAGE}/plan/intent.test.mjs`, `${PACKAGE}/plan/new.test.mjs`, `${PACKAGE}/plan/requirements.test.mjs`, `${KAAL}/plan/kaal.test.mjs`],
    });
    const r = lane(root);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /guard lane: the planned suite passed/);
  });

  it("fails when a planned test fails", () => {
    const r = lane(repo({ ...CONFIG, ...established(), ...plan({ [`${KAAL}/plan/kaal.test.mjs`]: FAIL }) }));
    assert.equal(r.status, 1, r.stdout + r.stderr);
  });

  it("fails when a planned test cannot execute", () => {
    const r = lane(repo({ ...CONFIG, ...established(), ...plan({ [`${PACKAGE}/plan/intent.test.mjs`]: `import { gone } from "./absent.mjs";\n` }) }));
    assert.notEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /guard lane: the planned suite failed/);
  });

  it("runs its tests even when it inherits a test runner's context, which would skip them all", () => {
    const root = repo({ ...CONFIG, ...established(), ...plan({ [`${KAAL}/plan/kaal.test.mjs`]: FAIL }) });
    const r = spawnSync(process.execPath, [LANE, "--root", root], { encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "", NODE_TEST_CONTEXT: "child-v8" } });
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /guard lane: the planned suite failed, 5 tests/);
  });

  it("refuses, and never falls back, when the planned suite is absent", () => {
    refuses(repo({ ...CONFIG, ...established() }), /the planned suite is absent: there is no packages\/kaal-guard\/test\/acceptance\/plan\//);
    const half = plan();
    for (const k of Object.keys(half)) if (k.startsWith(`${KAAL}/`)) delete half[k];
    refuses(repo({ ...CONFIG, ...established(), ...half }), /the planned suite is absent: there is no engineering\/guard\/acceptance\/plan\//);
  });

  it("refuses when a plan/ directory holds no test", () => {
    const empty = plan({ [`${KAAL}/plan/README.md`]: "" });
    delete empty[`${KAAL}/plan/kaal.test.mjs`];
    refuses(repo({ ...CONFIG, ...established(), ...empty }), /the planned suite is incomplete: engineering\/guard\/acceptance\/plan\/ holds no test/);
  });

  it("refuses when the planned suite lacks a test the established suite has, naming it", () => {
    const partial = plan();
    delete partial[`${PACKAGE}/plan/requirements.test.mjs`];
    refuses(repo({ ...CONFIG, ...established(), ...partial }), /packages\/kaal-guard\/test\/acceptance\/plan\/ lacks requirements\.test\.mjs/);
  });
});

describe("the Guard lane with contradictory declarations", () => {
  it("refuses both guard.json and .kaal/config/guard/", () => {
    refuses(repo({ ...LEGACY, ...CONFIG, ...established(), ...plan() }), /both in guard\.json and in \.kaal\/config\/guard\//);
  });

  it("refuses neither", () => {
    refuses(repo({ ...established(), ...plan() }), /KAAL declares no Guard checks/);
  });

  it("refuses a .kaal/config/guard that is a file, not a directory", () => {
    refuses(repo({ ".kaal/config/guard": "", ...established(), ...plan() }), /KAAL declares no Guard checks/);
  });
});
