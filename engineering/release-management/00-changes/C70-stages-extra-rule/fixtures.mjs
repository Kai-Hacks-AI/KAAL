// Fixtures of release/C70: the agreed structure of release/C35, with the Integrating stage declaring one extra rule.
import { GOOD } from '../C35-stages/helper.mjs';
export { judge } from '../C35-stages/helper.mjs';
export const RULE = { type: 'pull_request', parameters: { required_approving_review_count: 1, dismiss_stale_reviews_on_push: true, require_code_owner_review: false, require_last_push_approval: false, required_review_thread_resolution: false } };
const copy = (x) => JSON.parse(JSON.stringify(x));
// the agreed structure where Integrating declares RULE and its ruleset holds it after its checks
export function declared() {
  const f = GOOD();
  f.stages.stages.find((s) => s.name === 'Integrating').alsoRules = [copy(RULE)];
  f.rulesets.Integrating.rules.push(copy(RULE));
  return f;
}
