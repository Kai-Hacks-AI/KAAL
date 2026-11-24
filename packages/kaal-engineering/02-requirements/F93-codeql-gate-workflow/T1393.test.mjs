// Case engineering/T1393 tests: engineering/F93
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, gateJobs } from './fixture.mjs';
export const id = 'engineering/T1393';
export const tests = ['engineering/F93'];
export const title = 'the source has the two gate jobs after analyze, that run when analyze failed and cannot be skipped, with read permissions only';
export async function run() {
  const text = readFileSync(src, 'utf8');
  assert.ok(!/^\s*paths(-ignore)?:/m.test(text), 'a paths filter can skip the workflow');
  for (const { name, job } of gateJobs(text)) {
    assert.ok(job, `no job named ${name}`);
    assert.match(job, /needs:\s*(analyze|\[\s*analyze\s*\])/, `${name} does not need analyze`);
    const perm = job.match(/permissions:\n((?:\s{6,}.+\n?)+)/)?.[1] ?? '';
    const granted = perm.split('\n').map((l) => l.trim()).filter(Boolean);
    assert.deepEqual(granted.sort(), ['contents: read', 'security-events: read'], `${name} holds more or less than the two read permissions`);
    assert.ok(!/continue-on-error/.test(job), `${name} can fail without failing`);
    const conds = job.match(/^\s*if:.*$/gm) ?? [];
    assert.equal(conds.length, 1, `${name} has more than one condition`);
    assert.match(conds[0].replace(/\s+/g, ' '), /^ ?if: (\$\{\{ ?(!cancelled\(\)|always\(\)) ?\}\}|always\(\))\s*$/, `the condition of ${name} can skip it`);
  }
  for (const t of ['push:', 'pull_request:', 'merge_group:', 'schedule:']) assert.ok(text.includes(t), `the trigger ${t} is gone`);
}
