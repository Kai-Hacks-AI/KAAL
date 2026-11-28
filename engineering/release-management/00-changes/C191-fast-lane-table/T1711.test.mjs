// Case release/T1711 tests: release/C191. Permission is positive per file and per entry.
import assert from 'node:assert/strict';
import { lanes, EMPTY, item, claim, ITEM_ROOT, CLAIM_ROOT, add, mod, codes, load } from './fixture.mjs';
export const id = 'release/T1711';
export const tests = ['release/C191'];
export const title = 'an unfitting name, a path under no root, an unlisted status, a missing status or a deletion refuses the whole change';
export async function run() {
  const qualify = await load(import.meta.url);
  const bad = [
    [add('.github/workflows/x.yml'), 'outside-roots'], [add(ITEM_ROOT + 'README.md'), 'not-an-item'], [add(CLAIM_ROOT + 'sub/K1.json'), 'not-an-item'],
    [{ path: ITEM_ROOT + 'B3.md', status: 'D' }, 'deletion'], [{ path: ITEM_ROOT + 'B3.md', status: 'R', oldPath: ITEM_ROOT + 'B4.md', mode: '100644' }, 'rename'],
    [{ path: ITEM_ROOT + 'B3.md', status: 'T', mode: '120000' }, 'mode'], [{ path: ITEM_ROOT + 'B3.md', status: 'A', mode: '100755' }, 'mode'],
    [{ path: ITEM_ROOT + 'B3.md', status: 'C', mode: '100644' }, 'status'], [{ path: ITEM_ROOT + 'B3.md', mode: '100644' }, 'status'], [{ path: CLAIM_ROOT + 'K3.json', mode: '100644' }, 'status'],
    [mod(CLAIM_ROOT + 'K3.json'), 'status'],
  ];
  for (const [entry, code] of bad) {
    const r = qualify([add(ITEM_ROOT + 'B1.md'), entry], { lanes, existing: EMPTY });
    assert.equal(r.verdict, 'refused', JSON.stringify(entry) + ' was not refused'); assert.ok(codes(r).includes(code), JSON.stringify(entry) + ' lacks ' + code);
  }
  assert.equal(qualify([mod(ITEM_ROOT + 'B3.md')], { lanes, existing: EMPTY }).verdict, 'qualified', 'an M on an entry without a status list is allowed');
  assert.equal(qualify([mod(CLAIM_ROOT + 'K3.json')], { lanes: [item, { ...claim, status: ['A', 'M'] }], existing: EMPTY }).verdict, 'qualified', 'an M on an entry that lists it is allowed');
  const r = qualify([mod(CLAIM_ROOT + 'K3.json')], { lanes, existing: EMPTY });
  assert.equal(r.findings[0].kind, 'claim', 'the finding carries the kind of its file');
}
