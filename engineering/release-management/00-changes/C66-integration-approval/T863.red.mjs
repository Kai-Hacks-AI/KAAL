// Case release/T863 tests: release/CTL10
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T863';
export const tests = ['release/CTL10'];
export const title = 'only the integrating ruleset holds the approval rule; collecting, hotfixing and wiring stay checks-only, and stages.json declares the rule for the Integrating stage';
export async function run() {
  for (const name of ['collecting', 'hotfixing', 'wiring']) {
    const r = JSON.parse(readFileSync(join(RM, `05-src/wiring/rulesets/${name}.json`), 'utf8'));
    assert.deepEqual(r.rules.map((x) => x.type), ['required_status_checks'], `${name} holds a rule beyond its check`);
  }
  const stages = JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8'));
  const integrating = stages.stages.find((s) => s.name === 'Integrating');
  assert.deepEqual(integrating.alsoRules, ['pull_request'], 'the stage does not declare the approval rule');
  for (const s of stages.stages.filter((x) => x.name !== 'Integrating')) assert.ok(!s.alsoRules, `${s.name} declares an extra rule`);
}
