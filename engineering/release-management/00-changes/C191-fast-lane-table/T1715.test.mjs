// Case release/T1715 tests: release/C191. Classification is unambiguous: exactly one entry matches a file.
import assert from 'node:assert/strict';
import { lanes, item, claim, ITEM_ROOT, CLAIM_ROOT, add, mod, codes, load } from './fixture.mjs';
export const id = 'release/T1715';
export const tests = ['release/C191'];
export const title = 'a file that fits two entries is refused with ambiguous-lane naming both kinds, and either entry alone qualifies it';
export async function run() {
  const qualify = await load(import.meta.url);
  const open = { kind: 'open', roots: [ITEM_ROOT], name: '^B[0-9]+\\.md$', allow: item.allow };
  const only = { kind: 'only', roots: [ITEM_ROOT], name: '^B[0-9]+\\.md$', allow: item.allow, status: ['A'] };
  for (const [a, b] of [[open, only], [only, open], [open, { ...open, kind: 'twin' }], [only, { ...only, kind: 'twin' }]]) {
    const r = qualify([add(ITEM_ROOT + 'B1.md')], { lanes: [a, b] });
    assert.equal(r.verdict, 'refused'); assert.deepEqual(codes(r), ['ambiguous-lane']);
    assert.deepEqual(r.findings[0].kinds, [a.kind, b.kind].sort(), 'both kinds are named');
  }
  assert.equal(qualify([add(ITEM_ROOT + 'B1.md')], { lanes: [open] }).verdict, 'qualified');
  assert.equal(qualify([add(ITEM_ROOT + 'B1.md')], { lanes: [only] }).verdict, 'qualified');
  // overlapping roots with names that do not overlap are not ambiguous
  assert.equal(qualify([add(ITEM_ROOT + 'B1.md'), add(ITEM_ROOT + 'K1.json')], { lanes: [item, { ...claim, roots: [ITEM_ROOT], allow: item.allow }] }).verdict, 'qualified');
}
