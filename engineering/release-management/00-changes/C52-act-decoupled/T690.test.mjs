// Case release/T690 tests: release/C52
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { rows } from './fixtures.mjs';
export const id = 'release/T690';
export const tests = ['release/C52'];
export const title = 'the last row of the ACT template says only what the ACT merge does and names no other process';
export async function run() {
  const body = rows();
  assert.equal(body.length, 5, 'the ACT table is not five rows');
  const last = body.at(-1)[2];
  assert.ok(last.includes('Merge the approved ACT'), 'the last row does not name the merge of the ACT');
  assert.ok(last.includes('starts nothing'), 'the last row does not say that the merge starts nothing');
  assert.ok(last.includes('collector, which requires'), 'the last row does not state what the collector requires');
  for (const r of body) assert.ok(!/promot|wire|sync|hotfix|install/i.test(r[2]), `step ${r[0]} names another process`);
  assert.ok(last.length <= 160 && !last.includes('\n'), 'the last Action is not one short line');
}
