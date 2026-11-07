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
  const files = { "merge-group.yml": 3, "change-isolation.yml": 1, "lineage-synchronization.yml": 1, "promotion-source.yml": 1 };
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
