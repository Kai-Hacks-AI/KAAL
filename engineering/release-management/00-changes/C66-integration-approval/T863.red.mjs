// Case release/T863 tests: release/CTL10
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T863';
export const tests = ['release/CTL10'];
export const title = 'only the integrating ruleset holds the approval rule; collecting, hotfixing and wiring stay checks-only, and stages.json declares the rule, traced to release/CTL10 with its settings, for the Integrating stage';
export async function run() {
  for (const name of ['collecting', 'hotfixing', 'wiring']) {
    const r = JSON.parse(readFileSync(join(RM, `05-src/wiring/rulesets/${name}.json`), 'utf8'));
    assert.deepEqual(r.rules.map((x) => x.type), ['required_status_checks'], `${name} holds a rule beyond its check`);
  }
  const stages = JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8'));
  const integrating = stages.stages.find((s) => s.name === 'Integrating');
  const declared = (integrating.rules ?? []).find((r) => r.type === 'pull_request');
  assert.ok(declared, 'the stage does not declare the approval rule');
  assert.equal(declared.control, 'release/CTL10', 'the approval rule is not traced to release/CTL10');
  const source = JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/integrating.json'), 'utf8')).rules.find((r) => r.type === 'pull_request');
  assert.deepEqual(declared.parameters, source.parameters, 'the declared settings differ from the ruleset source');
  for (const s of stages.stages.filter((x) => x.name !== 'Integrating')) assert.ok(!(s.rules ?? []).some((r) => r.type === 'pull_request'), `${s.name} declares the approval rule`);
}
