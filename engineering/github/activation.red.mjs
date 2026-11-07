// engineering/T158 to T161: static Cases for the activation of deferred attestation (B1, plan of 7 November 2026, window 3
// runbook approved by the CPO). Run by hand; no suite or lane names this file:
//
//   node --test engineering/github/activation.red.mjs
//
// Deferred attestation lets the PR-level `Change Isolation` job and the merge group's `Change Isolation` job admit a
// ledger-bearing promotion without its attestation, because `Change Isolation (review)` judges the attestation at merge
// time, on the queued group. The activation is one flag, KAAL_ATTESTATION=deferred, in exactly those two judging steps.
// It must never reach the review workflows (that would defeat Case 6) and must never be a value a candidate can influence.
//
// These Cases are RED on a tree where deferred is not active (strict R1 and R2) and GREEN once the activation lands. They are
// static: they do not show GitHub's queue behaviour. The live proof is the trial, above all Case 6: an unattested ledger-bearing
// promotion admitted by deferred R1 must FAIL `Change Isolation (review)` on its group and must not merge.
// KAAL_ROOT=<dir> points the Cases at another checkout. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = process.env.KAAL_ROOT ? resolve(process.env.KAAL_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WF = join(ROOT, ".github", "workflows");
const names = readdirSync(WF).filter((f) => f.endsWith(".yml")).sort();
const wf = (name) => readFileSync(join(WF, name), "utf8");
const strip = (t) => t.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");

// One job: from its own header line up to the next job header (or the end).
const job = (text, id) => {
  const header = `\n  ${id}:\n`;
  const start = text.indexOf(header);
  assert.ok(start >= 0, `job ${id} exists`);
  const rest = text.slice(start + header.length);
  const next = rest.search(/\n  [a-z][a-z-]*:\n/);
  return next < 0 ? rest : rest.slice(0, next);
};
// One step of a job, by its name: from its `- name:` line up to the next step (or the end of the job).
const step = (jobText, name) => {
  const start = jobText.indexOf(`      - name: ${name}\n`);
  assert.ok(start >= 0, `step "${name}" exists`);
  const rest = jobText.slice(start + 8);
  const next = rest.search(/\n      - /);
  return jobText.slice(start, start + 8 + (next < 0 ? rest.length : next));
};

const PR_JOB = job(strip(wf("change-isolation.yml")), "change-isolation");
const GROUP_JOB = job(strip(wf("merge-group.yml")), "change-isolation");
const PR_STEP = step(PR_JOB, "Judge the complete change against the target");
const GROUP_STEP = step(GROUP_JOB, "Judge the merge group against its base");
const FLAG = /^ {10}KAAL_ATTESTATION: deferred$/m;

test("engineering/T158 B1 activation: helpers return exactly the requested job and step", () => {
  assert.match(PR_STEP, /^ {6}- name: Judge the complete change against the target\n/, "pull request step starts at its name");
  assert.match(PR_STEP, /--check Change-Isolation --github/, "pull request step runs the checker");
  assert.match(GROUP_STEP, /^ {6}- name: Judge the merge group against its base\n/, "group step starts at its name");
  assert.match(GROUP_STEP, /--check Change-Isolation --github/, "group step runs the checker");
  assert.doesNotMatch(GROUP_JOB, /name: Branching|name: Promotion Source/, "the group job holds only its own steps");
});

test("engineering/T159 B1 activation: deferred is set in the pull request job's judging step and in the merge group's Change Isolation judging step, as a literal", () => {
  for (const [label, s] of [["pull request", PR_STEP], ["merge group", GROUP_STEP]]) {
    assert.match(s, FLAG, `${label}: KAAL_ATTESTATION is the literal "deferred" in the step env`);
    assert.equal(s.match(/KAAL_ATTESTATION/g).length, 1, `${label}: set exactly once`);
    assert.ok(s.indexOf("KAAL_ATTESTATION") < s.indexOf("run:"), `${label}: set in env, before the run line`);
    assert.doesNotMatch(s, /KAAL_ATTESTATION:.*\$\{\{/, `${label}: no expression, so nothing the candidate controls reaches it`);
  }
  assert.equal(PR_JOB.match(/KAAL_ATTESTATION/g).length, 1, "pull request job: set in no other step");
  assert.equal(GROUP_JOB.match(/KAAL_ATTESTATION/g).length, 1, "merge group Change Isolation job: set in no other step");
});

test("engineering/T160 B1 activation: no other workflow or job is deferred, and the review workflows stay strict", () => {
  const holders = names.filter((n) => /KAAL_ATTESTATION/.test(strip(wf(n))));
  assert.deepEqual(holders, ["change-isolation.yml", "merge-group.yml"], "only the two judging workflows name the flag");
  const groupText = strip(wf("merge-group.yml"));
  assert.equal(groupText.match(/KAAL_ATTESTATION/g).length, 1, "merge-group.yml: once, in the Change Isolation job only");
  for (const n of ["change-isolation-review.yml", "merge-group-review.yml"]) {
    const t = strip(wf(n));
    assert.doesNotMatch(t, /deferred|KAAL_ATTESTATION/, `${n}: never deferred`);
    assert.match(t, /export KAAL_ATTESTED="\$ATTESTED"/, `${n}: still judges with the attestation it read`);
  }
  assert.doesNotMatch(strip(wf("merge-group-admission.yml")), /deferred|KAAL_ATTESTATION/, "the admission context is not deferred");
});

test("engineering/T161 B1 activation (precondition): the judging script honours the flag only when no attestation is supplied", () => {
  const sh = readFileSync(join(ROOT, "engineering", "github", "change-isolation.sh"), "utf8");
  assert.match(sh, /elif \[ "\$KAAL_ATTESTATION" = deferred \]; then/, "the script reads the flag, and only the exact value 'deferred'");
  assert.match(sh, /--attestation deferred/, "and passes the checker's deferred mode");
  const attested = sh.indexOf('if [ -n "$KAAL_ATTESTED" ]');
  assert.ok(attested >= 0 && attested < sh.indexOf('elif [ "$KAAL_ATTESTATION" = deferred ]'), "an explicit attestation is tried first and wins");
});
