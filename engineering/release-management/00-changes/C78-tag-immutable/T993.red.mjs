// Case release/T993 tests: release/C78
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T993';
export const tests = ['release/C78'];
export const title = 'the stage declaration is in stages.json as drafted, and the ruleset sources hold the declared values';
export async function run() {
  const md = readFileSync(join(RM, '00-changes/C78-tag-immutable/interface.md'), 'utf8');
  const draft = JSON.parse(md.split(/^## The declaration$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1]);
  const stages = JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8')).stages;
  const rulesets = (n) => JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/' + n + '.json'), 'utf8'));
  const pub = stages.find((s) => s.name === 'Publishing');
  assert.deepEqual(pub.rules, draft.rules, 'Publishing does not declare its rule');
  assert.equal(pub.rule, 'update', 'the compatibility key rule was dropped');
  const r = rulesets('publishing');
  assert.deepEqual(r.rules.map((x) => x.type), ['update'], 'the publishing source does not hold the update rule alone');
  assert.deepEqual(r.conditions.ref_name.include, ['refs/tags/trial-*@*']);
  assert.deepEqual(r.bypass_actors, [], 'a bypass actor is listed');
}
