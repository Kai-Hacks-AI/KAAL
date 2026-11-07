// engineering/T112 to T116: substantive merge_group evaluation (B1 step 2a, Cases C1 to C6 of
// engineering/change-isolation/ledger-b1-2a-plan.md). The trial runs on main (CPO amendment of 7 November 2026), so
// there is no disposable target and no trial-only default-branch mapping; T115 and T116 forbid one. Run by hand; no suite or lane names this file:
//
//   node --test engineering/change-isolation/merge-group.red.mjs
//
// These Cases are static and predicate-level. They do not show GitHub's merge_group behaviour; that is the
// trial on main (C1 to C5 live). Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const wf = (name) => readFileSync(join(ROOT, ".github", "workflows", name), "utf8");
const GROUP = wf("merge-group.yml");
const jobsOf = (text) => text.slice(text.indexOf("\njobs:"));
const jobBlocks = (text) => jobsOf(text).split(/\n  (?=[a-z][a-z-]*:\n)/).slice(1);
const LINEAGE = join(ROOT, "engineering", "github", "lineage.ts");
const lineage = (...args) => spawnSync(process.execPath, [LINEAGE, ...args], { encoding: "utf8" });

test("engineering/T112 C6: no merge-group job is skipped by a condition, ends in an unconditional success, or can write a check", () => {
  assert.match(GROUP, /^on:\n  merge_group:/m, "the workflow triggers only on merge_group");
  assert.doesNotMatch(GROUP, /\n\s+if:/, "no job or step is skipped with if:");
  assert.doesNotMatch(GROUP, /continue-on-error|exit 0\s*$|run:\s*(true|exit 0)\s*$/m, "nothing swallows a failure or passes unconditionally");
  assert.doesNotMatch(GROUP, /checks:\s*write/, "the group jobs create no check run");
  assert.doesNotMatch(GROUP, /pull_request/ , "the group workflow reads no pull_request event payload");
  const names = [...GROUP.matchAll(/\n    name: (.+)/g)].map((m) => m[1]).sort();
  assert.deepEqual(names, ["Branching", "Change Isolation", "Promotion Source"], "exactly the three required contexts, bare names");
});

test("engineering/T113 C1 and C2: the ci and CodeQL workflows run their existing jobs on the merge group", () => {
  for (const f of ["ci.yml", "codeql.yml"]) {
    const t = wf(f);
    assert.match(t, /\n  merge_group:\n    types: \[checks_requested\]/, `${f} triggers on merge_group`);
    assert.doesNotMatch(jobsOf(t), /\n\s+if:\s*github\.event_name/, `${f} does not special-case events`);
  }
});

test("engineering/T114 C4 and C5 regression: the trusted checker stays pinned to the real default branch; the default branch is the real one", () => {
  for (const block of jobBlocks(GROUP)) {
    for (const m of block.matchAll(/--base ("[^"]*"|\S+)/g)) {
      assert.doesNotMatch(m[1], /KAAL_DEFAULT|origin\//, `--base must not name the trial target: ${m[1]}`);
    }
  }
  assert.match(GROUP, /--check Branching[^\n]*--base "\$\(git rev-parse HEAD\)"/, "Branching takes its checker from the default-branch checkout");
  assert.match(GROUP, /--check Promotion-Source[^\n]*--base "\$\(git rev-parse HEAD\)"/, "Promotion Source takes its checker from the default-branch checkout");
  assert.match(GROUP, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, "every group job checks out the real default branch");
});

test("engineering/T115 C4 and C5: every KAAL_DEFAULT is the repository's real default branch; no workflow names a trial target", () => {
  const files = { "merge-group.yml": 4, "change-isolation.yml": 1, "lineage-synchronization.yml": 1, "promotion-source.yml": 1 };
  for (const [f, n] of Object.entries(files)) {
    const hits = wf(f).match(/KAAL_DEFAULT: .+/g) ?? [];
    assert.equal(hits.length, n, `${f} sets KAAL_DEFAULT ${n} time(s)`);
    for (const h of hits) assert.equal(h, "KAAL_DEFAULT: ${{ github.event.repository.default_branch }}", `${f}: ${h}`);
  }
  for (const f of ["merge-group.yml", "change-isolation.yml", "lineage-synchronization.yml", "promotion-source.yml", "ci.yml", "codeql.yml"]) {
    assert.doesNotMatch(wf(f), /trial\/ledger-queue|trial-only/, `${f} carries no trial target mapping`);
  }
});

test("engineering/T116 C5: the promotion predicate, with the real default branch, rejects an invalid source into main and accepts a kaal/* collector", () => {
  const fork = lineage("source", "o/r", "main", "main", "fork/r", "kaal/x");
  assert.equal(fork.status, 1, `a fork source into main is rejected: ${fork.stdout}${fork.stderr}`);
  const wrong = lineage("source", "o/r", "main", "main", "o/r", "claude/x");
  assert.equal(wrong.status, 1, "a non-kaal branch is rejected");
  const ok = lineage("source", "o/r", "main", "main", "o/r", "kaal/x");
  assert.equal(ok.status, 0, "a kaal/* collector of this repository is accepted");
  const elsewhere = lineage("source", "o/r", "main", "kaal/x", "fork/r", "kaal/y");
  assert.equal(elsewhere.status, 3, "control: a target that is not the default branch is not a promotion");
});

// R2, the merge-time review job (B1 step 3). Static Cases over merge-group-review.yml; its live behaviour is the trial on main.
const REVIEW = wf("merge-group-review.yml");

test("engineering/T123 R2: the review job is exactly `Change Isolation (review)`, runs only on the merge group, is never skipped and writes no check", () => {
  assert.match(REVIEW, /^on:\n  merge_group:\n    types: \[checks_requested\]\n\npermissions: \{\}/m, "triggers only on merge_group, no default permissions");
  assert.deepEqual([...REVIEW.matchAll(/\n    name: (.+)/g)].map((m) => m[1]), ["Change Isolation (review)"], "one job with the exact context name");
  assert.doesNotMatch(REVIEW, /\n\s+if:/, "no job or step is skipped with if:");
  assert.doesNotMatch(REVIEW, /continue-on-error|^\s*exit 0\s*$|run:\s*(true|exit 0)\s*$/m, "nothing swallows a failure or passes unconditionally (the wait step's `exit 0` is conditional on every required check having succeeded)");
  assert.doesNotMatch(REVIEW, /(checks|statuses|contents|pull-requests|actions):\s*write/, "read-only permissions: no write on the safety path");
  assert.doesNotMatch(REVIEW, /-X (POST|PATCH|PUT)|--method (POST|PATCH|PUT)|check-runs"?\s+(-f|--field|-F)/, "no API write at all");
});

test("engineering/T124 R2: the job binds the queued pull request to the group and reads its approvals twice, the last read being the final act", () => {
  assert.match(REVIEW, /run: \.github\/scripts\/bind-group\.sh review\b/, "the job binds through the one shared script");
  const bind = readFileSync(join(ROOT, ".github", "scripts", "bind-group.sh"), "utf8");
  assert.match(bind, /git merge-base --is-ancestor "\$PRHEAD" "\$GROUP_HEAD"/, "a merge group must contain the PR head");
  assert.match(bind, /git merge-tree --write-tree "\$GROUP_BASE_SHA" "\$PRHEAD"/, "a squash group must equal the PR merged into the group's base");
  // The behaviour of that script on both group shapes is judged by T143 to T153 (engineering/github/bind-group.red.mjs).
  const reads = REVIEW.match(/engineering\/change-isolation\/attest\.mjs --pr "\$PR_NUMBER"/g) ?? [];
  assert.equal(reads.length, 2, "approvals read twice");
  const last = REVIEW.lastIndexOf("attest.mjs --pr");
  assert.equal(REVIEW.indexOf("npx --no kaal-guard run --check Change-Isolation") < last, true, "the judgment comes before the last read");
  assert.equal(REVIEW.slice(last).includes("kaal-guard"), false, "nothing but comparisons follows the last read");
  assert.match(REVIEW, /\[ "\$FIRST_HEAD" = "\$PR_HEAD" \]/, "the first read returns the queued head");
  assert.match(REVIEW, /\[ "\$SECOND_HEAD" = "\$PR_HEAD" \]/, "the second read returns the queued head");
  assert.match(REVIEW, /\[ "\$SECOND_ATTESTED" = "\$FIRST_ATTESTED" \]/, "the attestation must not change");
});

test("engineering/T125 R2: the job is the last required check to finish, fails when another required check failed, and names only itself as excluded", () => {
  assert.match(REVIEW, /rules\/branches\/\$BASE_REF/, "the required checks are read from the branch's effective rules");
  assert.match(REVIEW, /grep -vx 'Change Isolation \(review\)'/, "only itself is left out of the wait");
  assert.match(REVIEW, /did not succeed on the group, so the group cannot merge/, "a failed required check fails the job");
  assert.match(REVIEW, /\[ -s required\.txt \] \|\| fail/, "an empty list of required checks fails closed");
  assert.match(REVIEW, /fail "the group's other required checks did not finish in time"/, "a timeout fails closed");
});

test("engineering/T126 R2: the trusted checker is the default branch's, and the group is judged against the group's own base", () => {
  assert.match(REVIEW, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, "checks out the real default branch");
  assert.match(REVIEW, /KAAL_DEFAULT: \$\{\{ github\.event\.repository\.default_branch \}\}/, "the real default branch");
  assert.match(REVIEW, /--check Change-Isolation --github --head "\$HEAD" --base "\$BASE" --base-ref "\$BASE_REF"/, "judges group head against group base");
  assert.match(REVIEW, /BASE: \$\{\{ github\.event\.merge_group\.base_sha \}\}/, "base is the group's base sha");
  assert.match(REVIEW, /HEAD: \$\{\{ github\.event\.merge_group\.head_sha \}\}/, "head is the group's head sha");
  assert.match(REVIEW, /ATTESTED: \$\{\{ steps\.first\.outputs\.attested \}\}/, "the attestation judged is the one derived from the approvals");
});

test("engineering/T127 R2: the wait fits inside the queue's own timeout, so the queue never gives up first", () => {
  const m = REVIEW.match(/timeout-minutes: (\d+)/);
  assert.ok(m && Number(m[1]) <= 55, "timeout-minutes is below the queue's 60-minute check timeout");
  const loop = REVIEW.match(/seq 1 (\d+)/), sleep = REVIEW.match(/sleep (\d+)/);
  assert.ok(loop && sleep && Number(loop[1]) * Number(sleep[1]) <= Number(m[1]) * 60, "the poll loop cannot outlast the job");
});
