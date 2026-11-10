// release-management/T25 to T30 (RED): a failing or held verdict carries its route to recovery (PLAN bind-merge-held-plan.md,
// "Recovery is part of the verdict"; Owner, 10 November 2026: tests are deterministic, but when they fail they point at the route to fix).
// Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/recovery.red.mjs
//
// The contract, asserted by parsing and by running the checker, never by matching words:
//   - every verdict that is not a pass carries one or more lines `Recovery: <command> (re-runs on: <event>[, <event>])`;
//   - each action is one of two executable kinds: a `gh pr merge` invocation for the pull request the verdict is about (a number, not a
//     placeholder), or `git push origin <head branch>` (a new head, for a verdict only a change of the candidate can fix);
//   - each event is one the workflow that issues the verdict is triggered by, read from its YAML, so the recovery re-runs the check.
//     That is static evidence: the live proof that the action re-triggers the check on GitHub is tracked per control in
//     recovery-coverage.json (T29) and is pending until a run shows it.
// The Case that fails today is the auto-merge trap: once the check fails, GitHub hides "enable auto-merge", and the verdict says
// "Enable auto-merge" without naming a command or an event that re-runs the check. Do not edit a Case to make it pass.
//
// Limitation: T25 to T27 cover the auto-merge verdicts (the trap Release - 0.0.1 found). The other verdicts of lineage.ts and the other
// release controls follow with their own Branching-split DO, each with its own recovery Cases. This screen does not prove GitHub's
// behaviour (that enabling auto-merge re-runs the check), which is the live proof.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { autoMerge } = await import(pathToFileURL(join(ROOT, "engineering", "github", "lineage.ts")).href);
const workflow = parse(readFileSync(join(ROOT, ".github", "workflows", "lineage-synchronization.yml"), "utf8"));
// YAML 1.1 reads the key `on` as the boolean true; accept either spelling of the trigger block.
const triggers = workflow.on ?? workflow[true];
const events = new Set(triggers.pull_request_target.types);

const RECOVERY = /^Recovery: (.+) \(re-runs on: ([a-z_]+(?:, [a-z_]+)*)\)$/;
/** The recovery steps of a verdict message: { command, events }[]. */
const recoveries = (message) =>
  message.split("\n").filter((l) => l.startsWith("Recovery:")).map((l) => {
    const m = RECOVERY.exec(l);
    assert.ok(m, `a recovery line has the form "Recovery: <command> (re-runs on: <event>)": ${JSON.stringify(l)}`);
    return { command: m[1], events: m[2].split(", ") };
  });
/** A new head: `git push origin <head branch>`; returns the branch. */
function parsePush(command) {
  const words = command.split(" ");
  assert.deepEqual(words.slice(0, 3), ["git", "push", "origin"], `a new-head recovery is a git push to origin: ${command}`);
  assert.equal(words.length, 4, `exactly one branch: ${command}`);
  return words[3];
}
/** A gh invocation, parsed into its words: `gh pr merge <number> [--auto] [--squash|--merge|--rebase] [--disable-auto]`. */
function parseGh(command) {
  const words = command.split(" ");
  assert.deepEqual(words.slice(0, 3), ["gh", "pr", "merge"], `a recovery is a gh pr merge invocation: ${command}`);
  const flags = words.slice(3).filter((w) => w.startsWith("--"));
  const numbers = words.slice(3).filter((w) => !w.startsWith("--"));
  assert.equal(numbers.length, 1, `exactly one pull request number: ${command}`);
  assert.match(numbers[0], /^[1-9][0-9]*$/, `the pull request number is a number, not a placeholder: ${command}`);
  return { pull: Number(numbers[0]), flags };
}

const facts = (over) => ({ baseRef: "kaal/hosting", head: "0123456789abcdef0123456789abcdef01234567", headRef: "claude/pr", expected: "squash", enabled: null, pull: 7, ...over });

test("T25: the auto-merge trap names the command that enables auto-merge and an event that re-runs the check", () => {
  const v = autoMerge(facts({ enabled: null }));
  assert.equal(v.kind, "fail", "interim: the single required check keeps failing without auto-merge (no weakening before the Branching split)");
  const steps = recoveries(v.message);
  assert.equal(steps.length, 1, "one recovery step");
  const { pull, flags } = parseGh(steps[0].command);
  assert.equal(pull, 7, "for the pull request the verdict is about");
  assert.deepEqual(flags.sort(), ["--auto", "--squash"], "enables auto-merge with the method its flow names");
  assert.ok(steps[0].events.includes("auto_merge_enabled"), "enabling auto-merge is the event that re-runs the check");
});

test("T25: a wrong method names the disable and the enable, each with the event that re-runs the check", () => {
  const v = autoMerge(facts({ expected: "squash", enabled: "merge" }));
  assert.equal(v.kind, "fail");
  const steps = recoveries(v.message);
  assert.equal(steps.length, 2, "disable, then enable with the right method");
  assert.deepEqual(parseGh(steps[0].command).flags, ["--disable-auto"]);
  assert.deepEqual(parseGh(steps[1].command).flags.sort(), ["--auto", "--squash"]);
  assert.deepEqual(steps.map((s) => s.events.at(-1)), ["auto_merge_disabled", "auto_merge_enabled"]);
});

test("T26: every recovery event is one the workflow that issues the verdict runs on, parsed from its YAML", () => {
  const verdicts = [facts({ enabled: null }), facts({ enabled: "merge" }), facts({ expected: "merge", enabled: "squash" })].map(autoMerge);
  for (const v of verdicts) {
    const steps = recoveries(v.message);
    assert.ok(steps.length > 0, `a ${v.kind} verdict carries a recovery: ${v.message}`);
    for (const s of steps) for (const e of s.events) assert.ok(events.has(e), `${e} re-runs Branching: its pull_request_target types are ${[...events].join(", ")}`);
  }
});

test("T26: a verdict that no method can fix names a new head as its route, a push whose event re-runs the check", () => {
  const v = autoMerge(facts({ expected: null, enabled: null }));
  assert.equal(v.kind, "fail");
  const steps = recoveries(v.message);
  assert.equal(steps.length, 1, "one recovery step");
  assert.equal(parsePush(steps[0].command), "claude/pr", "a push of the head branch the verdict is about");
  assert.ok(!/--auto\b/.test(steps[0].command), "no method is right, so enabling auto-merge is no recovery");
  assert.deepEqual(steps[0].events, ["synchronize"], "a new head runs the check again");
  assert.ok(events.has("synchronize"));
});

test("T27: every non-pass verdict of the auto-merge judgment carries a recovery", () => {
  const all = [];
  for (const expected of [null, "squash", "merge"]) for (const enabled of [null, "squash", "merge"]) all.push(autoMerge(facts({ expected, enabled })));
  const bare = all.filter((v) => v.kind !== "pass" && !v.message.includes("Recovery: "));
  assert.deepEqual(bare.map((v) => v.message), [], "verdicts that fail or hold without a recovery");
});

test("T28: a held bind Merge, which Guard reports as a succeeding job with a warning, never satisfies a gate", async () => {
  const { judgeLanes } = await import(pathToFileURL(join(ROOT, "engineering", "release-management", "05-src", "lanes", "gate.mjs")).href);
  const expected = [{ lane: "bind Merge", host: "ubuntu" }];
  for (const outcome of ["held", "success-with-warning"]) {
    const r = judgeLanes({ expected, results: [{ lane: "bind Merge", host: "ubuntu", outcome }], accepts: [], authorized: [], boundary: "integration" });
    assert.equal(r.passed, false, `${outcome} is no pass`);
    assert.match(r.reasons.join("\n"), new RegExp(outcome), "and the reason names it");
  }
  const passed = judgeLanes({ expected, results: [{ lane: "bind Merge", host: "ubuntu", outcome: "passed" }], accepts: [], authorized: [], boundary: "integration" });
  assert.equal(passed.passed, true, "only a pass passes");
});

test("T29: every release control is listed in the recovery coverage; a pending control names the RED that must add its Cases", () => {
  const cov = JSON.parse(readFileSync(join(ROOT, "engineering", "release-management", "04-test", "recovery-coverage.json"), "utf8")).controls;
  const cases = readFileSync(join(ROOT, "engineering", "release-management", "00-changes", "cases.md"), "utf8");
  const CONTROLS = ["version Package", "approve Publishing", "verify Package Promotion", "audit Lineage", "isolate Change", "verify Ancestry",
    "scan Vulnerabilities", "scan Dependencies", "bind Merge", "approve Promotion", "test Candidate", "serialize Promotion",
    "accept Capability", "approve Change", "test Integration"];
  assert.deepEqual(Object.keys(cov).sort(), [...CONTROLS].sort(), "all 15 controls, no other");
  for (const [name, c] of Object.entries(cov)) {
    if (c.status === "covered") {
      assert.ok(c.cases?.length > 0, `${name}: covered by named Cases`);
      for (const id of c.cases) assert.ok(cases.includes(`| ${id} |`), `${name}: ${id} is registered in cases.md`);
    } else {
      assert.equal(c.status, "pending", `${name}: covered or pending`);
      assert.ok(c.step, `${name}: pending names the step whose RED adds its recovery Cases`);
    }
    assert.ok(["pending", "proven"].includes(c.liveProof), `${name}: live proof is tracked`);
  }
});

// T30: where a failure could have been found earliest comes from Guard's registry, not from a new mechanism (Owner, 10 November 2026:
// "checks are registered to guard"). A check declares `runs` (hook, ci) and `facts`; the hook supplies head, base, base-ref and changed.
// So the earliest registered stage is development when `runs` has hook, else integration; the earliest possible stage is development when
// every declared fact is one the hook supplies. A gap between them is where the team learns to move a check. The line is made from the
// declaration by one function, `earliestStage` in engineering/github/earliest.ts, and printed beside the Recovery lines.
import { readdirSync } from "node:fs";
const GUARD = join(ROOT, ".kaal", "config", "guard");
const declaration = (name) => parse(readFileSync(join(GUARD, `${name}.md`), "utf8").split("---")[1]);
const earliestModule = () => import(pathToFileURL(join(ROOT, "engineering", "github", "earliest.ts")).href); // lazy, so each Case fails on its own

test("T30: the earliest stage is read from the Guard declaration (runs and facts), for every registered check", async () => {
  const { earliestStage, DEVELOPMENT_FACTS } = await earliestModule();
  assert.deepEqual([...DEVELOPMENT_FACTS].sort(), ["base", "base-ref", "changed", "head"], "the facts the hook supplies, as Guard documents them");
  const push = earliestStage(declaration("push"));
  assert.deepEqual([push.registered, push.possible], ["development", "development"], "push runs in the hook and needs only hook facts");
  const branching = earliestStage(declaration("Branching"));
  assert.equal(branching.registered, "integration", "Branching is registered for ci only");
  for (const f of readdirSync(GUARD).filter((n) => n.endsWith(".md"))) {
    const e = earliestStage(declaration(f.slice(0, -3)));
    assert.ok(["development", "integration"].includes(e.registered) && ["development", "integration"].includes(e.possible), `${f}: stages from the registry`);
    assert.ok(e.line.length <= 100 && /^Earliest: (development|integration) \(.+\)$/.test(e.line), `${f}: one short line: ${e.line}`);
  }
});

test("T30: a check that could run in development but is registered for ci only is reported as a gap, with the move named", async () => {
  const { earliestStage } = await earliestModule();
  const e = earliestStage({ runs: ["ci"], facts: ["head", "base", "base-ref"] });
  assert.deepEqual([e.registered, e.possible, e.gap], ["integration", "development", true]);
  assert.match(e.line, /^Earliest: development \(.*runs: \[hook\].*\)$/, "names the declaration change that moves it");
  const only = earliestStage({ runs: ["ci"], facts: ["head", "pull-request"] });
  assert.deepEqual([only.registered, only.possible, only.gap], ["integration", "integration", false], "a fact the hook cannot supply keeps it at integration");
});
