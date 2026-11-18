// Case release/T1002 tests: release/C79
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const CHANGE = join(RM, '00-changes/C79-derived-judge-facts');
export const id = 'release/T1002';
export const tests = ['release/C79'];
export const title = 'the helper derives the facts of the checkout, the controls are the ones in 04-controls, and the judge passes on them';
export async function run() {
  assert.ok(existsSync(join(CHANGE, 'derive.mjs')), 'derive.mjs is absent');
  const { real, judge } = await import(join(CHANGE, 'derive.mjs'));
  const facts = real();
  assert.deepEqual(facts.stages, JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8')), 'the stages are not the real ones');
  for (const n of ['Integrating', 'Collecting', 'Hotfixing', 'Wiring', 'Promoting', 'Publishing']) {
    assert.deepEqual(facts.rulesets[n], JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/' + n.toLowerCase() + '.json'), 'utf8')), n + ' is not the real source');
  }
  const found = readdirSync(join(RM, '04-controls')).filter((d) => /^CTL\d+-/.test(d)).map((d) => 'release/' + d.split('-')[0]).sort();
  assert.deepEqual(facts.controls.map((c) => c.id).filter((i) => i.startsWith('release/')).sort(), found, 'the controls are not the ones in 04-controls');
  const out = judge(facts);
  assert.equal(out.kind, 'pass', 'the judge does not pass on the real sources: ' + JSON.stringify(out.findings));
}
