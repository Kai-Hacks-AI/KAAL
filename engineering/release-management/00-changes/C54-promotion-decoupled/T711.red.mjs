// Case release/T711 tests: release/C54
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, rows } from './fixtures.mjs';
export const id = 'release/T711';
export const tests = ['release/C54'];
export const title = 'the Dependency row of the expanded PROMOTION table does not name the SYNC process or its Change';
export async function run() {
  const text = readFileSync(join(RM, '00-changes/C54-promotion-decoupled/interface.md'), 'utf8');
  const section = text.split(/^## The expanded table \(the source is behind main\)$/m)[1];
  assert.ok(section, 'the expanded table is absent from interface.md');
  const dep = section.split('\n').filter((l) => l.trim().startsWith('|') && l.includes('| Dependency |'));
  assert.equal(dep.length, 1, 'the expanded table has not exactly one Dependency row');
  assert.ok(!/sync|c45/i.test(dep[0]), 'the Dependency row names the SYNC process or C45');
}
