// Case release/T663 tests: release/C46
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIXED, REAL, RM, WHO, table } from './fixtures.mjs';
export const id = 'release/T663';
export const tests = ['release/C46'];
export const title = 'the PROMOTION table has two paths: five rows when the source is current, and with a Dependency row for the SYNC (a real #number, sequential steps, the other rows unchanged) when the source is behind main';
export async function run() {
  assert.ok(existsSync(REAL), 'promotion.md is absent from 05-src/wiring/templates');
  const current = table(readFileSync(REAL, 'utf8')).slice(2);
  assert.equal(current.length, 5, 'the current-source path is not five rows');
  assert.ok(!current.some((r) => r[1] === 'Dependency'), 'the current-source path has a Dependency row');
  const text = readFileSync(join(RM, '00-changes/C46-promotion-template/interface.md'), 'utf8');
  const section = text.split(/^## The expanded table \(the source is behind main\)$/m)[1];
  assert.ok(section, 'the expanded table is absent from interface.md');
  const rows = section.split('\n').filter((l) => l.trim().startsWith('|')).map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
  assert.deepEqual(rows[0], FIXED, 'the expanded header is not Step | Who | Action | Status | Details');
  const body = rows.slice(2);
  assert.equal(body.length, 6, 'the behind-main path is not six rows');
  body.forEach((r, i) => {
    assert.equal(r.length, 5, `row ${i} is not five cells`);
    assert.equal(r[0], String(i), `row ${i} is not step ${i}`);
    assert.ok(WHO.includes(r[1]), `row ${i} has the Who ${r[1]}`);
  });
  assert.deepEqual(body.map((r) => r[1]), ['Predecessor', 'Worker', 'Dependency', 'Worker', 'Reviewer', 'Successor'], 'the expanded roles are not in the stated order');
  assert.match(body[2][4], /^#\d+$/, 'the Dependency row does not carry a #number in Details');
  assert.deepEqual([body[2][3]], ['pending'], 'the Dependency row does not start pending');
  const others = body.filter((_, i) => i !== 2).map((r, i) => [r[1], r[2], r[3], r[4]].join('|'));
  const defaults = current.map((r) => [r[1], r[2], r[3], r[4]].join('|'));
  assert.deepEqual(others, defaults, 'the rows other than the Dependency differ from the default rows');
}
