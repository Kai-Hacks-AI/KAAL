// release-management/C19 Cases, RED and unwired (not listed in `test:engineering`).
// T1 is the drift Case: the effective configuration GitHub reports for a collector branch must show the
//    new `integration` ruleset supplying a pull_request rule with approval of the most recent push.
//    It reads GET /repos/{owner}/{repo}/rules/branches/{branch} from KAAL_EFFECTIVE_RULES (a JSON file).
//    RED until the Owner has imported the ruleset: a file that describes a setting is not evidence it is active.
// T2 and T3 judge the draft itself.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const draft = JSON.parse(readFileSync(new URL("./integration.ruleset.draft.json", import.meta.url), "utf8"));
const pullRequest = (rules) => rules.find((r) => r.type === "pull_request");

test("C19/T1 the effective rules of a collector show approval of the most recent push", () => {
  const file = process.env.KAAL_EFFECTIVE_RULES;
  assert.ok(file, "no effective configuration provided: read GET /rules/branches/<collector> into KAAL_EFFECTIVE_RULES");
  const effective = JSON.parse(readFileSync(file, "utf8"));
  const rule = pullRequest(effective.filter((r) => r.ruleset_source_type === "Repository" || r.ruleset_id));
  assert.ok(rule, "no pull_request rule is in force on the collector");
  assert.equal(rule.parameters.require_last_push_approval, true);
});

test("C19/T2 the draft covers one-level and two-level collectors", () => {
  const include = draft.conditions.ref_name.include;
  assert.ok(include.includes("refs/heads/kaal/**"), "one-level collectors");
  assert.ok(include.includes("refs/heads/kaal/**/*"), "two-level collectors, which refs/heads/kaal/** does not reach");
});

test("C19/T3 the draft adds only the approval rule: no bypass, no status checks, no merge queue", () => {
  assert.deepEqual(draft.bypass_actors, []);
  assert.deepEqual(draft.rules.map((r) => r.type), ["pull_request"]);
  assert.equal(pullRequest(draft.rules).parameters.require_last_push_approval, true);
  assert.deepEqual(pullRequest(draft.rules).parameters.allowed_merge_methods, ["squash", "merge"]);
});
