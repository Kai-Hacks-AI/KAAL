// release-management/T25 to T28 (RED): a failing or held verdict carries its route to recovery (PLAN bind-merge-held-plan.md,
// "Recovery is part of the verdict"; Owner, 10 November 2026: tests are deterministic, but when they fail they point at the route to fix).
// Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/recovery.red.mjs
//
// The contract, asserted by parsing and by running the checker, never by matching words:
//   - every verdict that is not a pass carries one or more lines `Recovery: <command> (re-runs on: <event>[, <event>])`;
//   - each command is a real `gh pr merge` invocation for the pull request the verdict is about (a number, not a placeholder);
//   - each event is one the workflow that issues the verdict is triggered by, read from its YAML, so the recovery re-runs the check.
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

const facts = (over) => ({ baseRef: "kaal/hosting", head: "0123456789abcdef0123456789abcdef01234567", expected: "squash", enabled: null, pull: 7, ...over });

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

test("T26: a verdict that no method can fix says so and gives no command that cannot help", () => {
  const v = autoMerge(facts({ expected: null, enabled: null }));
  assert.equal(v.kind, "fail");
  for (const s of recoveries(v.message)) assert.ok(!/--auto\b/.test(s.command), "no method is right, so enabling auto-merge is no recovery");
  assert.match(v.message, /Recovery: /, "the route is a new head that makes the Branching verdict pass, named in a Recovery line");
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
