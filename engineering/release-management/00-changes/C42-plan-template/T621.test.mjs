// Case release/T621 tests: release/C42
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { FIXED, REAL, WHO, table } from './fixtures.mjs';
export const id = 'release/T621';
export const tests = ['release/C42'];
export const title = 'the HOW TO WORK table of the PLAN template has the five columns, a Predecessor first, a Successor last, sequential steps and a Who from the allowed set, and the five default rows';
export async function run() {
  assert.ok(existsSync(REAL), 'plan.md is absent from 05-src/wiring/templates');
  const rows = table(readFileSync(REAL, 'utf8'));
  assert.ok(rows.length >= 3, 'the HOW TO WORK table is absent');
  assert.deepEqual(rows[0], FIXED, 'the header is not Step | Who | Action | Status | Details');
  assert.equal(rows[1].length, 5, 'the separator is not five cells');
  assert.ok(rows[1].every((c) => /^:?-{3,}:?$/.test(c)), 'the separator is malformed');
  const body = rows.slice(2);
  body.forEach((r, i) => {
    assert.equal(r.length, 5, `row ${i} is not five cells`);
    assert.equal(r[0], String(i), `row ${i} is not step ${i}`);
    assert.ok(WHO.includes(r[1]), `row ${i} has the Who ${r[1]}`);
  });
  assert.equal(body[0][1], 'Predecessor');
  assert.equal(body.at(-1)[1], 'Successor');
  assert.deepEqual(body.map((r) => r[1]), ['Predecessor', 'Worker', 'Worker', 'Reviewer', 'Successor'], 'the default rows are not the five');
}
