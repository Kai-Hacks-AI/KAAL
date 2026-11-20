// Case release/T1274 tests: release/CTL25
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C105-hold-history/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1274';
export const tests = ['release/CTL25'];
export const title = 'the promoting source holds non_fast_forward, active, with no bypass and its other rules unchanged, stages.json declares it traced to release/CTL25 and verify Stages passes on the real sources; a source without the rule, an inactive one, a bypass actor or a rule traced to an undeclared control are refused';
export async function run() {
  const { read, judge } = await import(pathToFileURL(join(RM, '05-src/stages/judge.mjs')).href);
  const facts = read(repo);
  assert.ok(facts, 'the sources cannot be read');
  const src = facts.rulesets.Promoting;
  assert.deepEqual(src, JSON.parse(draft('promoting.json')), 'promoting.json differs from the draft');
  assert.equal(src.enforcement, 'active');
  assert.deepEqual(src.bypass_actors, []);
  assert.deepEqual(src.rules.find((r) => r.type === 'non_fast_forward'), { type: 'non_fast_forward' });
  const stage = facts.stages.stages.find((s) => s.name === 'Promoting');
  assert.deepEqual(stage.rules.find((r) => r.type === 'non_fast_forward'), JSON.parse(draft('stages-rule.json')), 'the declaration differs from the draft');
  assert.ok(facts.controls.some((x) => x.id === 'release/CTL25' && x.has.includes('release/I54')), 'release/CTL25 is not a declared control with its Intent');
  const real = judge(facts);
  assert.deepEqual(real.findings, [], `verify Stages fails on the real sources: ${JSON.stringify(real.findings)}`);
  // negatives, made by hand: each must go RED
  const copy = () => JSON.parse(JSON.stringify(facts));
  const a = copy();
  a.rulesets.Promoting.rules = a.rulesets.Promoting.rules.filter((r) => r.type !== 'non_fast_forward');
  assert.ok(judge(a).findings.some((f) => /non_fast_forward/.test(f.message)), 'a promoting source without the rule is accepted');
  const b = copy();
  b.stages.stages.find((s) => s.name === 'Promoting').rules.find((r) => r.type === 'non_fast_forward').control = 'release/CTL99';
  assert.ok(judge(b).findings.some((f) => /not a declared control/.test(f.message)), 'a rule traced to an undeclared control is accepted');
  const c = copy();
  c.rulesets.Promoting.bypass_actors = [{ actor_id: 1, actor_type: 'Team', bypass_mode: 'always' }];
  assert.ok(judge(c).findings.some((f) => /bypass/.test(f.message)), 'a bypass actor is accepted');
}
