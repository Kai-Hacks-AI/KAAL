// Case release/T1710 tests: release/C191. Each file is judged by its own entry, so one change carries items, claims or both.
import assert from 'node:assert/strict';
import { lanes, EMPTY, item, claim, ITEM_ROOT, CLAIM_ROOT, add, mod, codes, load } from './fixture.mjs';
export const id = 'release/T1710';
export const tests = ['release/C191'];
export const title = 'a mixed diff qualifies when every file fits its own entry, and a file of one kind in the root of the other is refused';
export async function run() {
  const qualify = await load(import.meta.url);
  const ok = qualify([add(ITEM_ROOT + 'B1.md'), add(CLAIM_ROOT + 'K7.json')], { lanes, existing: EMPTY });
  assert.equal(ok.verdict, 'qualified'); assert.deepEqual(ok.findings, []);
  assert.equal(qualify([add(ITEM_ROOT + 'B1.md')], { lanes, existing: EMPTY }).verdict, 'qualified', 'items alone');
  assert.equal(qualify([add(CLAIM_ROOT + 'K7.json')], { lanes, existing: EMPTY }).verdict, 'qualified', 'claims alone');
  for (const p of [CLAIM_ROOT + 'B1.md', ITEM_ROOT + 'K7.json']) {
    const r = qualify([add(ITEM_ROOT + 'B2.md'), add(p)], { lanes, existing: EMPTY });
    assert.equal(r.verdict, 'refused', p + ' was not refused'); assert.ok(codes(r).includes('not-an-item'));
  }
}
