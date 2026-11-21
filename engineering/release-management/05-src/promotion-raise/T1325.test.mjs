// Case release/T1325 tests: release/F70
import assert from 'node:assert/strict';
import { decide, retroText } from './tree-fixtures.mjs';
export const id = 'release/T1325';
export const tests = ['release/F70'];
export const title = 'a collector whose tree is not exactly one well-formed ACT inside its folders is not raised, and the skip names the judge; UNKNOWN never raises';
export async function run() {
  const retro = (n, reflects) => ({ n, reflects });
  const cases = [
    ['two retros', 'demand', { retros: [retro(1, ['cap/C2']), retro(2, ['cap/C2'])] }],
    ['a retro that reflects only some of the Changes', 'demand', { changes: [{ n: 2, name: 'first-thing' }, { n: 3, name: 'second-thing' }], retros: [retro(1, ['cap/C2'])] }],
    ['no retro', 'demand', { retros: [] }],
    ['a retro the form judge refuses', 'verify', { retros: [{ n: 1, reflects: ['cap/C2'], text: retroText(1, ['cap/C2']).replace('## Liked', '## Praised') }] }],
    ['a retro the finder refuses', 'verify', { retros: [{ n: 1, reflects: ['cap/C2'], text: retroText(1, ['cap/C2']).replace('format: 4L', '') }] }],
    ['a Change folder with no record', 'demand', { changes: [{ n: 2, name: 'first-thing', id: '' }], retros: [retro(1, ['cap/C2'])] }],
  ];
  for (const [name, judge, spec] of cases) {
    const d = await decide({}, spec);
    assert.equal(d.action, 'skip', name);
    assert.equal(d.reason, 'not-a-final-step', name);
    assert.match(d.detail, new RegExp(`^${judge} Act: `), `${name} names the judge`);
  }
  const outside = await decide({}, undefined, ['engineering/cap/02-learnings/retros/RT1.md', 'engineering/cap/05-src/x.mjs']);
  assert.equal(outside.action, 'skip');
  assert.match(outside.detail, /^limit Act: FAIL/);
  const unknown = await decide({}, undefined, null);
  assert.equal(unknown.action, 'skip', 'changed paths that cannot be read are UNKNOWN and never raise');
  assert.match(unknown.detail, /^limit Act: UNKNOWN/);
  const unread = await decide({ tree: undefined });
  assert.equal(unread.reason, 'tree-unreadable');
}
