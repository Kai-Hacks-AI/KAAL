// release-management/F15/T1 (permanent, moves next to its code in 05-src/rulesets with the DO) and C19/T2, C19/T3 (migration): RED and unwired (not listed in `test:engineering`).
// T1 is the drift Case: the effective configuration GitHub reports for a collector branch must show the
//    new `integration` ruleset supplying a pull_request rule with approval of the most recent push.
//    It reads GET /repos/{owner}/{repo}/rules/branches/{branch} from KAAL_EFFECTIVE_RULES (a JSON file).
//    RED until the Owner has imported the ruleset: a file that describes a setting is not evidence it is active.
// T2 and T3 judge the draft itself.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const draft = JSON.parse(readFileSync(new URL("../05-src/rulesets/integration.ruleset.draft.json", import.meta.url), "utf8"));
const pullRequest = (rules) => rules.find((r) => r.type === "pull_request");

test("release-management/F15/T1 the effective rules of a collector show approval of the most recent push", () => {
  const file = process.env.KAAL_EFFECTIVE_RULES;
  assert.ok(file, "no effective configuration provided: read GET /rules/branches/<collector> into KAAL_EFFECTIVE_RULES");
  const effective = JSON.parse(readFileSync(file, "utf8"));
  // The list holds one rule per ruleset that applies, so the legacy rule (last-push approval off) is listed beside the new one.
  // Judge the set: some applied pull_request rule requires approval of the most recent push, and it is not the legacy ruleset's (24952357).
  const LEGACY = 24952357;
  const supplied = effective.filter((r) => r.type === "pull_request" && r.parameters?.require_last_push_approval === true && r.ruleset_id !== LEGACY);
  assert.ok(supplied.length > 0, "no ruleset other than the legacy one supplies approval of the most recent push");
});

test("release-management/C19/T2 the draft covers one-level and two-level collectors", () => {
  const include = draft.conditions.ref_name.include;
  assert.ok(include.includes("refs/heads/kaal/**"), "one-level collectors");
  assert.ok(include.includes("refs/heads/kaal/**/*"), "two-level collectors, which refs/heads/kaal/** does not reach");
});

test("release-management/C19/T3 the draft adds approval and protects the collector from rewrites: no bypass, no status checks, no merge queue", () => {
  assert.deepEqual(draft.bypass_actors, []);
  assert.deepEqual(draft.rules.map((r) => r.type).sort(), ["deletion", "non_fast_forward", "pull_request"]);
  assert.equal(pullRequest(draft.rules).parameters.require_last_push_approval, true);
  assert.deepEqual(pullRequest(draft.rules).parameters.allowed_merge_methods, ["squash", "merge"]);
});
