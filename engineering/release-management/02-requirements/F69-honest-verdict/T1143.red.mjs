// Case release/T1143 tests: release/F69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1143';
export const tests = ['release/F69'];
export const title = "a collector that only waits for the seat still reads raisable, and the seat is a separate line";
export async function run() {
  const { verdict, seated } = await loadDraft('verdict.mjs');
  const ds = ['kaal/a/one', 'kaal/a/two', 'kaal/a/three'].map((c) => verdict(facts({ collector: c }), NOW));
  const free = seated(ds, { openPromotions: [], capacity: 1 });
  assert.deepEqual(free.map((x) => x.verdict), ['raisable', 'raisable', 'raisable']);
  assert.deepEqual(free.map((x) => x.seat), ['free', 'taken', 'taken']);
  assert.deepEqual(free.map((x) => x.action), ['raise', 'none', 'none']);
  const full = seated(ds, { openPromotions: [{ number: 9 }], capacity: 1 });
  assert.deepEqual(full.map((x) => x.verdict), ['raisable', 'raisable', 'raisable']);
  assert.ok(full.every((x) => x.seat === 'taken' && x.action === 'none'));
  assert.equal(seated([verdict(facts({ aheadOfMain: 0 }), NOW)], {})[0].seat, 'n/a');
}
