// Case release/T700 tests: release/C53
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { rows } from './fixtures.mjs';
export const id = 'release/T700';
export const tests = ['release/C53'];
export const title = 'the last row of the SYNC template says only what the SYNC merge does and does not name PROMOTION';
export async function run() {
  const body = rows();
  assert.equal(body.length, 5, 'the SYNC table is not five rows');
  const last = body.at(-1)[2];
  assert.ok(last.includes('Merge the approved SYNC'), 'the last row does not name the merge of the SYNC');
  assert.ok(last.includes('starts nothing'), 'the last row does not say that the merge starts nothing');
  assert.ok(last.includes('which requires'), 'the last row does not state what the target branch requires');
  assert.ok(!/promot/i.test(last), 'the last row names PROMOTION');
  assert.ok(last.length <= 160 && !last.includes('\n'), 'the last Action is not one short line');
}
