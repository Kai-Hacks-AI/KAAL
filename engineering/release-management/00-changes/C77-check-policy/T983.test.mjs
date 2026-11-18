// Case release/T983 tests: release/C77
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T983';
export const tests = ['release/C77'];
export const title = 'the stage declaration is in stages.json as drafted, and the ruleset sources hold the declared values';
export async function run() {
  const md = readFileSync(join(RM, '00-changes/C77-check-policy/interface.md'), 'utf8');
  const draft = JSON.parse(md.split(/^## The declaration$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1]);
  const stages = JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8')).stages;
  const rulesets = (n) => JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/' + n + '.json'), 'utf8'));
  const rule = (s) => s.rules.find((r) => r.type === 'required_status_checks');
  const names = ['Integrating', 'Promoting', ...stages.find((s) => s.name === 'Integrating').parts.map((p) => p.name)];
  const all = (n) => stages.find((s) => s.name === n) ?? stages.find((s) => s.name === 'Integrating').parts.find((p) => p.name === n);
  for (const n of names) {
    const r = rule(all(n));
    assert.deepEqual(r.settingControls, { strict_required_status_checks_policy: 'release/CTL14', do_not_enforce_on_create: 'release/CTL14' }, n + ' does not declare a control for each setting');
  }
  for (const n of ['integrating', 'collecting', 'hotfixing', 'wiring', 'promoting']) {
    const p = rulesets(n).rules.find((r) => r.type === 'required_status_checks').parameters;
    assert.equal(p.strict_required_status_checks_policy, false, n + ': up to date is required');
    assert.equal(p.do_not_enforce_on_create, n !== 'promoting', n + ': do_not_enforce_on_create is not as declared');
  }
  assert.equal(draft.rules[0].parameters.do_not_enforce_on_create, true);
}
