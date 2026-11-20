// Case release/T1133 tests: release/CTL20
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C91-gate-verify-triggers/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1133';
export const tests = ['release/CTL20'];
export const title = 'stages.json declares verify Triggers traced to release/CTL20 and verify Stages passes on the real sources; a promoting source without it, or declared without a control, is refused';
export async function run() {
  const { read, judge } = await import(pathToFileURL(join(RM, '05-src/stages/judge.mjs')).href);
  const facts = read(repo);
  assert.ok(facts, 'the sources cannot be read');
  const stage = facts.stages.stages.find((s) => s.name === 'Promoting');
  const status = stage.rules.find((r) => r.type === 'required_status_checks');
  const c = status.checks.find((x) => x.name === 'verify Triggers');
  assert.deepEqual(c, JSON.parse(draft('stages-check.json')), 'the declaration differs from the draft');
  assert.ok(facts.controls.some((x) => x.id === 'release/CTL20' && x.has.includes('release/I50')), 'release/CTL20 is not a declared control with its Intent');
  const real = judge(facts);
  assert.deepEqual(real.findings, [], `verify Stages fails on the real sources: ${JSON.stringify(real.findings)}`);
  // negatives, made by hand and few: each must go RED
  const copy = () => JSON.parse(JSON.stringify(facts));
  const a = copy();
  const rule = a.rulesets.Promoting.rules.find((r) => r.type === 'required_status_checks');
  rule.parameters.required_status_checks = rule.parameters.required_status_checks.filter((x) => x.context !== 'verify Triggers');
  assert.ok(judge(a).findings.some((f) => /required checks/.test(f.message)), 'a promoting source without the check is accepted');
  const b = copy();
  b.stages.stages.find((s) => s.name === 'Promoting').rules.find((r) => r.type === 'required_status_checks').checks.find((x) => x.name === 'verify Triggers').control = 'release/CTL99';
  assert.ok(judge(b).findings.some((f) => /not a declared control/.test(f.message)), 'a check traced to an undeclared control is accepted');
}
