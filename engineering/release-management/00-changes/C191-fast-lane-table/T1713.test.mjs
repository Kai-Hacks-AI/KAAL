// Case release/T1713 tests: release/C191. The roots never cover the lane's own rules.
import assert from 'node:assert/strict';
import { lanes, item, claim, ITEM_ROOT, CLAIM_ROOT, add, mod, codes, load } from './fixture.mjs';
export const id = 'release/T1713';
export const tests = ['release/C191'];
export const title = 'no entry, no roots, a root outside its allow pattern, or a root covering rule paths is refused whole with roots-cover-rules';
export async function run() {
  const qualify = await load(import.meta.url);
  const one = [add(ITEM_ROOT + 'B1.md')];
  const tables = [undefined, [], [{ ...item, roots: [] }], [{ ...item, roots: undefined }], [{ ...item, roots: ['packages/kaal-backlog/'] }], [{ ...item, roots: ['packages/'] }],
    [{ ...item, roots: ['.github/'] }], [{ ...item, roots: ['engineering/'] }], [{ ...item, roots: [''] }], [{ ...item, roots: ['/'] }], [{ ...item, roots: ['packages/kaal-backlog/lib/'] }],
    [{ ...item, roots: ['packages/kaal-backlog/04-controls/'] }], [{ ...item, allow: '^.*$', roots: ['engineering/release-management/05-src/'] }], [{ ...item, allow: '^.*$', roots: ['.github/workflows/'] }],
    [item, { ...claim, roots: [CLAIM_ROOT, 'packages/kaal-core/lib/'], allow: '^packages/.*/$' }], [item, { ...item }], [{ ...item, status: ['D'] }], [{ ...item, status: [] }], [{ ...item, name: '(' }]];
  for (const lanesBad of tables) {
    const r = qualify(one, { lanes: lanesBad });
    assert.equal(r.verdict, 'refused', JSON.stringify(lanesBad) + ' was accepted'); assert.ok(codes(r).includes('roots-cover-rules'));
  }
  assert.equal(qualify(one, { lanes }).verdict, 'qualified');
}
