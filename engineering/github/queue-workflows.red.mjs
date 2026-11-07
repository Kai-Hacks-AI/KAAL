// engineering/T137 to T142: static Cases for the workflows that let Branching and the review check work under a
// merge queue (B1 F1b and F2, plan of 7 November 2026). Run by hand; no suite or lane names this file:
//
//   node --test engineering/github/queue-workflows.red.mjs
//
// These Cases are static and predicate-level. They do not show GitHub's queue behaviour. The live proof is the trial on
// main, above all Case 6: a ledger-bearing promotion admitted to the queue on the pull request head's success must FAIL
// the merge group's own `Change Isolation (review)` run and must not merge. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WF = join(ROOT, ".github", "workflows");
const wf = (name) => readFileSync(join(WF, name), "utf8");
const strip = (t) => t.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
const SYNC = strip(wf("lineage-synchronization.yml"));
const GROUP = strip(wf("merge-group.yml"));
const ADMIT = strip(wf("merge-group-admission.yml"));
const REVIEW = strip(wf("merge-group-review.yml"));
const block = (text, id) => text.slice(text.indexOf(`\n  ${id}:\n`)).split(/\n  (?=[a-z][a-z-]*:\n)/)[1];

test("engineering/T137 F1b: both Branching jobs read the base branch's rules before judging, only for the default branch, and fail closed", () => {
  for (const [label, t] of [["pull request", block(SYNC, "lineage-synchronization")], ["merge group", block(GROUP, "branching")]]) {
    assert.match(t, /gh api "repos\/\$GITHUB_REPOSITORY\/rules\/branches\/\$\{?BASE(_REF)?\}?"/, `${label}: reads rules/branches/<base>`);
    assert.match(t, /KAAL_RULES=\$RUNNER_TEMP\/rules\.json" >> "\$GITHUB_ENV"/, `${label}: exports KAAL_RULES`);
    assert.match(t, /cannot be read"; exit 2/, `${label}: an unreadable response fails the job (exit 2)`);
    assert.ok(t.indexOf("rules/branches") < t.indexOf("--check Branching"), `${label}: the rules are read before Branching judges`);
  }
  assert.match(block(SYNC, "lineage-synchronization"), /if: github\.event\.pull_request\.base\.ref == github\.event\.repository\.default_branch/, "pull request path: only for the default branch");
  assert.match(block(GROUP, "branching"), /if \[ "\$BASE" = "\$KAAL_DEFAULT" \]/, "merge group path: only for the default branch");
  assert.doesNotMatch(SYNC + GROUP, /\|\|\s*true|continue-on-error/, "no read failure is swallowed");
});

test("engineering/T138 F1b: reading the rules adds no permission and takes nothing from the candidate", () => {
  assert.match(block(SYNC, "lineage-synchronization"), /permissions:\n      contents: read\n    steps:/, "pull request Branching job holds contents: read only");
  assert.match(block(GROUP, "branching"), /permissions:\n      contents: read\n      pull-requests: read\n    steps:/, "group Branching job keeps its two read permissions");
  assert.doesNotMatch(SYNC + GROUP, /(contents|pull-requests|checks|statuses|actions|id-token): write/, "no write permission anywhere");
  assert.match(SYNC, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, "the checkout is still the default branch");
});

test("engineering/T139 F2: the admission workflow is its own file, pull_request_target only, with no permission at all", () => {
  assert.match(ADMIT, /^on:\n  pull_request_target:\n    types: \[opened, synchronize, reopened, ready_for_review\]\n/m, "triggers only on pull_request_target");
  assert.doesNotMatch(ADMIT, /merge_group|\n  pull_request:|\n  workflow_dispatch/, "no merge_group, pull_request or manual trigger");
  assert.equal([...ADMIT.matchAll(/^\s*permissions:\s*\{\}\s*$/gm)].length, 2, "permissions: {} at workflow level and on the job");
  assert.doesNotMatch(ADMIT, /permissions:\n\s+\w/, "no permission is granted");
  assert.match(ADMIT, /\n    name: Change Isolation \(review\)\n/, "the job is named exactly Change Isolation (review)");
});

test("engineering/T140 F2: the admission job reads nothing, runs nothing of the candidate, and judges nothing", () => {
  assert.doesNotMatch(ADMIT, /\buses:|actions\/checkout|secrets\.|GH_TOKEN|github\.token|\$\{\{ *github\.(event|head_ref)/, "no action, no checkout, no secret or token, no event data interpolated");
  const steps = ADMIT.slice(ADMIT.indexOf("steps:"));
  assert.ok(/^\s+echo "/m.test(steps), "a notice step exists");
  assert.doesNotMatch(steps.replace(/^\s+echo "[^\n]*$/gm, ""), /node|npm|npx|git |gh |curl|attest|kaal-guard|exit /, "nothing but echo runs");
  assert.match(ADMIT, /not an attestation/, "the notice says it is not an attestation");
});

test("engineering/T141 F2: the merge group review workflow keeps its kind: merge_group only, own read-only token, judges", () => {
  assert.match(REVIEW, /^on:\n  merge_group:\n    types: \[checks_requested\]\n/m, "triggers only on merge_group");
  assert.doesNotMatch(REVIEW, /pull_request/, "no pull request trigger");
  assert.match(REVIEW, /\n    name: Change Isolation \(review\)\n/, "same context name");
  assert.doesNotMatch(REVIEW, /\n\s+if:/, "no step is skipped");
  assert.match(REVIEW, /permissions:\n      contents: read\n      pull-requests: read\n      checks: read/, "read-only permissions, as approved");
  assert.match(REVIEW, /attest\.mjs/, "it still derives the attestation");
  assert.match(REVIEW, /--check Change-Isolation/, "it still judges the group");
});

test("engineering/T142 F2: exactly two workflows report the context, one per event, and no other job answers to it", () => {
  const files = readdirSync(WF).filter((f) => /\.ya?ml$/.test(f));
  const bearers = files.filter((f) => /\n    name: Change Isolation \(review\)\n/.test(strip(wf(f)))).sort();
  assert.deepEqual(bearers, ["merge-group-admission.yml", "merge-group-review.yml"], "only these two name the context");
  assert.ok(/pull_request_target/.test(ADMIT) && !/pull_request_target/.test(REVIEW), "they answer to different events");
  assert.ok(!/merge_group/.test(ADMIT) && !/pull_request/.test(REVIEW), "neither answers to the other's event");
});
