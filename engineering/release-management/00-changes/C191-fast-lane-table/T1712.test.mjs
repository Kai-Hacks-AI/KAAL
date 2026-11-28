// Case release/T1712 tests: release/C191. Collisions are judged per kind on the full resulting tree.
import assert from 'node:assert/strict';
import { lanes, item, claim, ITEM_ROOT, CLAIM_ROOT, add, mod, codes, load } from './fixture.mjs';
export const id = 'release/T1712';
export const tests = ['release/C191'];
export const title = 'the same key in another kind is fine, a second file with a key of its own kind is refused, editing the same file is not a collision';
export async function run() {
  const qualify = await load(import.meta.url);
  const existing = { item: [ITEM_ROOT + 'B3-first.md'], claim: [CLAIM_ROOT + 'K5.json'] };
  assert.equal(qualify([add(CLAIM_ROOT + 'K3.json')], { lanes, existing }).verdict, 'qualified', 'key 3 of another kind');
  const clash = qualify([add(ITEM_ROOT + 'B3-second.md')], { lanes, existing });
  assert.equal(clash.verdict, 'refused'); assert.deepEqual(clash.findings, [{ code: 'duplicate-number', path: ITEM_ROOT + 'B3-second.md', kind: 'item' }]);
  const suffixed = { ...claim, name: '^K([1-9][0-9]*)(?:-[a-z0-9]+)?\\.json$' };
  const claimClash = qualify([add(CLAIM_ROOT + 'K5-again.json')], { lanes: [item, suffixed], existing });
  assert.equal(claimClash.verdict, 'refused'); assert.deepEqual(claimClash.findings, [{ code: 'duplicate-number', path: CLAIM_ROOT + 'K5-again.json', kind: 'claim' }]);
  const twice = qualify([add(ITEM_ROOT + 'B7.md'), add(ITEM_ROOT + 'B7-again.md')], { lanes, existing });
  assert.equal(twice.verdict, 'refused'); assert.ok(codes(twice).includes('duplicate-number'));
  assert.equal(qualify([add(ITEM_ROOT + 'B8.md'), add(CLAIM_ROOT + 'K8.json')], { lanes, existing }).verdict, 'qualified', 'same key in two kinds');
  assert.equal(qualify([mod(ITEM_ROOT + 'B3-first.md')], { lanes, existing }).verdict, 'qualified', 'editing the same file');
}
