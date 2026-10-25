// The Guard lane's selection in each state KAAL can be in, and its refusals, in disposable
// repositories: the established suite, the planned suite, and every absent, incomplete or
// contradictory state, which must fail with a diagnostic and never fall back. Node built-ins only,
// so the Guard jobs run it on every supported OS before any install.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { BOUNDARY, RED, Refusal, UNIT, outcomes, register, select } from "./guard.mjs";

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
const lane = (root, ...args) => spawnSync(process.execPath, [LANE, "--root", root, ...args], { encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "", GITHUB_BASE_REF: "", GITHUB_REF_NAME: "" } });

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

/** A planned test file with one test per `[name, passes]`. */
const tests = (...cases) => `import { test } from "node:test";\n${cases.map(([name, passes, options]) => `test(${JSON.stringify(name)}, ${options ? `${JSON.stringify(options)}, ` : ""}() => { ${passes ? "" : 'throw new Error("red");'} });\n`).join("")}`;

/** A register of Feature REDs for `collector`, one entry per identity. */
const reds = (collector, ...identities) => ({ [RED]: JSON.stringify({ collector, entries: identities.map((test) => ({ test, class: "Feature RED", until: "guard/C99", authority: "the Owner's review 1" })) }) });

/** A KAAL on .kaal/config/guard/ whose planned suite holds these named tests, and these registered REDs. */
const planned = (file, register = {}) => repo({ ...CONFIG, ...established(), ...plan({ [`${PACKAGE}/plan/new.test.mjs`]: file }), ...register });

describe("the Guard lane's Feature REDs (guard/C45)", () => {
  it("holds, never passes, a failure registered as a Feature RED for the branch the run targets, and names it", () => {
    const root = planned(tests(["guard/T1 [guard/F1]: planned", false], ["guard/T2 [guard/F1]: green", true]), reds("kaal/guard", "guard/T1"));
    const r = lane(root, "--target", "kaal/guard");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^RED: guard\/T1: Feature RED until guard\/C99 \(the Owner's review 1\)$/m);
    assert.match(r.stdout, /^held: Guard lane: the planned suite has 1 registered Feature REDs and no other failure/m);
    assert.doesNotMatch(r.stdout, /suite passed/, "a held run reads as passed");
    assert.match(r.stdout, /^not ok \d+ - guard\/T1 /m, "the RED's own result is not visible");
  });

  it("holds nothing where the run targets another branch: a promotion to main fails on every RED", () => {
    const root = planned(tests(["guard/T1 [guard/F1]: planned", false]), reds("kaal/guard", "guard/T1"));
    for (const target of ["main", ""]) {
      const r = lane(root, ...(target ? ["--target", target] : []));
      assert.equal(r.status, 1, `${target || "no target"}: ${r.stdout}${r.stderr}`);
      assert.match(r.stdout, /not held: guard\/T1 failed and is not a Feature RED registered/);
    }
  });

  it("on GitHub Actions takes the target from the event payload alone, never from --target or GITHUB_BASE_REF", () => {
    const root = planned(tests(["guard/T1 [guard/F1]: planned", false]), reds("kaal/guard", "guard/T1"));
    const event = (payload) => {
      const path = join(root, "..", `event-${Math.random()}.json`);
      writeFileSync(path, JSON.stringify(payload));
      return path;
    };
    const run = (env, ...args) => spawnSync(process.execPath, [LANE, "--root", root, ...args], { encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "true", GITHUB_STEP_SUMMARY: "", GITHUB_BASE_REF: "", GITHUB_REF_NAME: "", GITHUB_EVENT_NAME: "", GITHUB_EVENT_PATH: "", ...env } });
    const pr = (base) => ({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: event({ pull_request: { base: { ref: base }, head: { ref: "kaal/guard" } } }) });
    assert.equal(run(pr("kaal/guard")).status, 0, "a pull request into kaal/guard does not hold its registered RED");
    // A promotion: its base is main. Neither the environment nor an argument can make it a development run.
    const promotion = run({ ...pr("main"), GITHUB_BASE_REF: "kaal/guard", GITHUB_REF_NAME: "kaal/guard" });
    assert.equal(promotion.status, 1, promotion.stdout + promotion.stderr);
    assert.match(promotion.stdout, /not held: guard\/T1 failed and is not a Feature RED registered for main/);
    const forced = run(pr("main"), "--target", "kaal/guard");
    assert.equal(forced.status, 2, forced.stdout + forced.stderr);
    assert.match(forced.stderr, /--target is refused on GitHub Actions/);
    assert.doesNotMatch(forced.stdout, /# (pass|fail) /, "a refused lane ran tests");
    // A push to kaal/guard holds; a push to main, another event or an unreadable payload holds nothing.
    assert.equal(run({ GITHUB_EVENT_NAME: "push", GITHUB_EVENT_PATH: event({ ref: "refs/heads/kaal/guard" }) }).status, 0);
    assert.equal(run({ GITHUB_EVENT_NAME: "push", GITHUB_EVENT_PATH: event({ ref: "refs/heads/main" }), GITHUB_REF_NAME: "kaal/guard" }).status, 1);
    assert.equal(run({ GITHUB_EVENT_NAME: "pull_request_target", GITHUB_EVENT_PATH: event({ pull_request: { base: { ref: "kaal/guard" } } }) }).status, 1);
    assert.equal(run({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: join(root, "absent.json"), GITHUB_BASE_REF: "kaal/guard" }).status, 1);
  });

  it("elsewhere holds only for --target, never for GITHUB_BASE_REF or GITHUB_REF_NAME", () => {
    const root = planned(tests(["guard/T1 [guard/F1]: planned", false]), reds("kaal/guard", "guard/T1"));
    const r = spawnSync(process.execPath, [LANE, "--root", root], { encoding: "utf8", env: { ...process.env, GITHUB_ACTIONS: "", GITHUB_BASE_REF: "kaal/guard", GITHUB_REF_NAME: "kaal/guard" } });
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.equal(lane(root, "--target", "kaal/guard").status, 0);
  });

  it("fails a run that targets another branch while any Feature RED is registered, even one not yet written or failing", () => {
    const root = planned(tests(["guard/T2 [guard/F1]: green", true]), reds("kaal/guard", "guard/T9"));
    const r = lane(root, "--target", "main");
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /not held: engineering\/guard\/red\.json still registers 1 Feature REDs for kaal\/guard; a run that targets main requires none outstanding/);
    assert.equal(lane(root, "--target", "kaal/guard").status, 0, "the collector's own run fails on an entry awaiting its PLAN");
  });

  it("fails on a failure that is not registered, and on one with no Test Case identity", () => {
    const register = reds("kaal/guard", "guard/T1");
    const other = lane(planned(tests(["guard/T1 [guard/F1]: planned", false], ["guard/T3 [guard/F1]: regressed", false]), register), "--target", "kaal/guard");
    assert.equal(other.status, 1, other.stdout + other.stderr);
    assert.match(other.stdout, /not held: guard\/T3 failed and is not a Feature RED registered for kaal\/guard/);
    const anonymous = lane(planned(tests(["guard/T1 [guard/F1]: planned", false], ["no identity", false]), register), "--target", "kaal/guard");
    assert.equal(anonymous.status, 1, anonymous.stdout + anonymous.stderr);
    assert.match(anonymous.stdout, /not held: a failure with no Test Case identity: no identity/);
  });

  it("fails when a registered Test Case passes, until its entry is removed", () => {
    const r = lane(planned(tests(["guard/T1 [guard/F1]: now green", true]), reds("kaal/guard", "guard/T1")), "--target", "kaal/guard");
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /not held: guard\/T1 passes but engineering\/guard\/red\.json still registers it/);
  });

  it("fails when a todo or skip marker masks a result", () => {
    for (const options of [{ todo: "later" }, { skip: "later" }]) {
      const r = lane(planned(tests(["guard/T1 [guard/F1]: masked", false, options]), reds("kaal/guard", "guard/T1")), "--target", "kaal/guard");
      assert.equal(r.status, 1, r.stdout + r.stderr);
      assert.match(r.stdout, /not held: a todo or skip marker masks a result: guard\/T1/);
    }
  });

  it("lists a skipped test with no Test Case identity, such as a unit test that does not apply on one OS, without failing", () => {
    const r = lane(planned(tests(["guard/T2 [guard/F1]: green", true], ["not on this OS", true, { skip: true }])), "--target", "kaal/guard");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^skipped, not a Test Case: not on this OS$/m);
  });

  it("reports a registered Test Case not yet written as awaiting its PLAN, holding nothing for it", () => {
    const r = lane(planned(tests(["guard/T2 [guard/F1]: green", true]), reds("kaal/guard", "guard/T9")), "--target", "kaal/guard");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^awaiting its PLAN: guard\/T9: registered until guard\/C99, not yet written$/m);
    assert.match(r.stdout, /suite passed/);
  });

  it("refuses a register that is not one, never reading it as empty", () => {
    for (const bad of ["{", JSON.stringify({ collector: "main", entries: [] }), JSON.stringify({ collector: "kaal/guard", entries: [{ test: "guard/T1", class: "Regression RED", until: "x", authority: "y" }] })]) {
      const root = planned(tests(["guard/T1 [guard/F1]: planned", false]), { [RED]: bad });
      assert.throws(() => register(root), (e) => e instanceof Refusal && e.todo.length > 0);
      const r = lane(root, "--target", "kaal/guard");
      assert.equal(r.status, 2, r.stdout + r.stderr);
      assert.match(r.stderr, /engineering\/guard\/red\.json (cannot be read|is not a register|has an entry)/);
      assert.match(r.stderr, /\n {2}do: \S/);
      assert.doesNotMatch(r.stdout, /# (pass|fail) /, "a refused lane ran tests");
    }
  });

  it("counts a suite that failed only through its tests once, by its tests", () => {
    const tap = "TAP version 13\n# Subtest: guard/F1 suite\n    not ok 1 - guard/T1 [guard/F1]: planned\n      ---\n      failureType: 'testCodeFailure'\n      ...\nnot ok 1 - guard/F1 suite\n  ---\n  failureType: 'subtestsFailed'\n  ...\n";
    const o = outcomes(tap);
    assert.deepEqual([...o.failed], ["guard/T1"]);
    assert.deepEqual(o.unidentified, []);
  });
});

describe("KAAL's own register", () => {
  it("holds only Feature REDs for kaal/guard, each with the Change it awaits and the Owner's authority", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const text = readFileSync(join(root, RED), "utf8");
    const data = JSON.parse(text);
    assert.equal(data.collector, "kaal/guard");
    for (const e of data.entries) {
      assert.equal(e.class, "Feature RED", e.test);
      assert.match(e.authority, /review \d+/, e.test);
      assert.match(e.until, /guard\/C\d+/, e.test);
    }
  });
});
