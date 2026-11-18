// Case release/T973 tests: release/C76
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T973';
export const tests = ['release/C76'];
export const title = 'the stage declaration is in stages.json as drafted, and the ruleset sources hold the declared values';
export async function run() {
  const md = readFileSync(join(RM, '00-changes/C76-ruleset-standing/interface.md'), 'utf8');
  const draft = JSON.parse(md.split(/^## The declaration$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1]);
  const stages = JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8')).stages;
  const rulesets = (n) => JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/' + n + '.json'), 'utf8'));
  const names = ['Integrating', 'Promoting', 'Publishing'];
  for (const n of names) assert.deepEqual(stages.find((s) => s.name === n).standing, draft.standing, n + ' does not declare its standing');
  for (const p of stages.find((s) => s.name === 'Integrating').parts) assert.deepEqual(p.standing, draft.standing, p.name + ' does not declare its standing');
  for (const n of ['integrating', 'collecting', 'hotfixing', 'wiring', 'promoting', 'publishing']) {
    const r = rulesets(n);
    assert.equal(r.enforcement, 'active', n + ' is not active');
    assert.deepEqual(r.bypass_actors, [], n + ' lists a bypass actor');
  }
}
