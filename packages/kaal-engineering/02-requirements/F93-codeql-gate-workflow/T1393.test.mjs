// Case engineering/T1393 tests: engineering/F93
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src } from './fixture.mjs';
export const id = 'engineering/T1393';
export const tests = ['engineering/F93'];
export const title = 'the source has a job verify CodeQL after analyze, that runs when analyze failed, with read permissions only';
export async function run() {
  const text = readFileSync(src, 'utf8');
  const job = text.split(/\n  (?=[a-z-]+:\n)/).find((j) => /^verify[-a-z]*:/.test(j) && /name: verify CodeQL/.test(j));
  assert.ok(job, 'no job named verify CodeQL');
  assert.match(job, /needs:\s*(analyze|\[\s*analyze\s*\])/, 'verify CodeQL does not need analyze');
  assert.match(job, /if:.*(always\(\)|!cancelled\(\))/, 'verify CodeQL is skipped when analyze fails');
  const perm = job.match(/permissions:\n((?:\s{6,}.+\n?)+)/)?.[1] ?? '';
  const granted = perm.split('\n').map((l) => l.trim()).filter(Boolean);
  assert.deepEqual(granted.sort(), ['contents: read', 'security-events: read'], 'verify CodeQL holds more or less than the two read permissions');
  for (const t of ['push:', 'pull_request:', 'merge_group:', 'schedule:']) assert.ok(text.includes(t), `the trigger ${t} is gone`);
}
