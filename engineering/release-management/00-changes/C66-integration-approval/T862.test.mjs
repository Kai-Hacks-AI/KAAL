// Case release/T862 tests: release/CTL10
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T862';
export const tests = ['release/CTL10'];
export const title = 'the integrating ruleset source requires one approving review of the exact head and dismisses a stale one, for kaal/**, hotfix/** and wire/**, with no bypass actor and its checks unchanged';
export async function run() {
  const draft = JSON.parse(readFileSync(join(RM, '00-changes/C66-integration-approval/interface.md'), 'utf8').split(/^## Draft of integrating\.json$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1]);
  const real = JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/integrating.json'), 'utf8'));
  assert.deepEqual(real, { ...draft, name: '20 - integrating' }, 'integrating.json differs from the draft, but for the name its stage declares (release/C106)');
  assert.deepEqual(real.conditions.ref_name.include, ['refs/heads/kaal/**', 'refs/heads/hotfix/**', 'refs/heads/wire/**']);
  assert.deepEqual(real.bypass_actors, [], 'a bypass actor is listed');
  const pr = real.rules.find((r) => r.type === 'pull_request');
  assert.ok(pr, 'there is no pull_request rule');
  assert.equal(pr.parameters.required_approving_review_count, 1);
  assert.equal(pr.parameters.dismiss_stale_reviews_on_push, true, 'a stale approval is not dismissed');
  assert.equal(pr.parameters.require_code_owner_review, false);
  const checks = real.rules.find((r) => r.type === 'required_status_checks').parameters.required_status_checks.map((c) => c.context);
  assert.deepEqual(checks, ['verify Stages (Integrating)', 'verify Stages (Developing)'], 'the required checks changed');
}
