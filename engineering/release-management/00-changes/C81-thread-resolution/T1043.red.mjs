// Case release/T1043 tests: release/CTL10
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const IFACE = readFileSync(join(RM, '00-changes/C81-thread-resolution/interface.md'), 'utf8');
const draft = (name) => IFACE.split(new RegExp('^## Draft of ' + name.replace('.', '\\.') + '$', 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1043';
export const tests = ['release/CTL10'];
export const title = 'the integrating source requires every review thread to be resolved, with the approval, the dismissal, the checks, the targets and the empty bypass list unchanged';
export async function run() {
  const real = JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/integrating.json'), 'utf8'));
  const pr = real.rules.find((r) => r.type === 'pull_request');
  assert.ok(pr, 'there is no pull_request rule');
  assert.equal(pr.parameters.required_review_thread_resolution, true, 'an unresolved thread does not block');
  assert.equal(readFileSync(join(RM, '00-changes/C81-thread-resolution/interface.md'), 'utf8').includes('"required_review_thread_resolution": true'), true);
  assert.deepEqual({ ...pr.parameters, required_review_thread_resolution: false }, {
    required_approving_review_count: 1, dismiss_stale_reviews_on_push: true,
    require_code_owner_review: false, require_last_push_approval: false, required_review_thread_resolution: false,
  }, 'another setting of the approval rule changed');
  assert.deepEqual(real.conditions.ref_name.include, ['refs/heads/kaal/**', 'refs/heads/hotfix/**', 'refs/heads/wire/**']);
  assert.deepEqual(real.bypass_actors, [], 'a bypass actor is listed');
  const checks = real.rules.find((r) => r.type === 'required_status_checks').parameters.required_status_checks.map((c) => c.context);
  assert.deepEqual(checks, ['verify Stages (Integrating)', 'verify Stages (Developing)'], 'the required checks changed');
}
