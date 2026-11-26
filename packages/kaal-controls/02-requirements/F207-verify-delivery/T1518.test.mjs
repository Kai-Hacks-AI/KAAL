// Case controls/T1518 tests: controls/F207
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1518';
export const tests = ['controls/F207'];
export const title = 'verify Delivery names a delivered entry no declaration correlates to, and an incomplete, partial, stale, empty-but-unproven or malformed inventory can neither pass nor be baselined';
const inv = (entries, o = {}) => ({ revision: 's', scope: 'pkg', complete: true, entries, ...o });
export async function run() {
  const { findUnrecorded } = await load('verify-delivery.mjs');
  const decl = inv([{ id: 'c/CTL1', path: 'p/CTL1.md' }, { id: 'c/CTL2', path: 'a/CTL2.md' }]);
  const find = (delivered, o = {}) => findUnrecorded({ declarations: decl, delivered, revision: 's', scope: 'pkg', ...o });
  assert.deepEqual(find(inv(['c/CTL1', 'a/CTL2.md', 'x/orphan.yml', 'y/other.yml'])), ['unrecorded:x/orphan.yml', 'unrecorded:y/other.yml'], 'an undeclared delivered entry was missed, or a declared one was named');
  assert.deepEqual(find(inv([])), [], 'a complete empty delivery was not clean');
  assert.deepEqual(find(inv(['x/orphan.yml']), { declarations: inv([]) }), ['unrecorded:x/orphan.yml'], 'a complete empty declaration did not name every delivered entry');
  const bad = {
    'empty but not proven complete': inv([], { complete: false }),
    'partial non-empty': inv(['c/CTL1'], { complete: false }),
    'completeness missing': { revision: 's', scope: 'pkg', entries: [] },
    'completeness not boolean true': inv([], { complete: 'yes' }),
    'stale revision': inv([], { revision: 'other' }),
    'other scope': inv([], { scope: 'other' }),
    'no entries list': { revision: 's', scope: 'pkg', complete: true },
    'malformed entry': inv([7]),
    missing: null,
  };
  for (const [what, d] of Object.entries(bad)) {
    assert.throws(() => find(d), `a ${what} delivery inventory gave a result`);
    assert.throws(() => find(inv([]), { declarations: d }), `a ${what} declaration inventory gave a result`);
  }
  for (const b of [{ revision: '' }, { scope: '' }, { declarations: [] }]) assert.throws(() => find(inv([]), b), 'bad input did not throw');
  const { runControl } = await load('adapter.mjs');
  const old = ['unrecorded:x/orphan.yml'];
  const go = (delivered, baseline = old) => runControl({ id: 'controls/CTL2', mode: 'ratchet', check: () => find(delivered), input: {}, baseline, previous: baseline, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal((await go(inv(['x/orphan.yml']))).verdict, 'PASS', 'an old undeclared entry was not allowed');
  assert.equal((await go(inv(['x/orphan.yml', 'z/new.yml']))).verdict, 'FAIL', 'a new undeclared entry passed the ratchet');
  for (const [what, d] of Object.entries(bad)) {
    const r = await go(d, ['unrecorded:x/orphan.yml', 'unrecorded:z/new.yml']);
    assert.equal(r.verdict, 'UNKNOWN', `a ${what} inventory passed or was filtered by an allowance`);
    assert.equal(r.blocked, true, `a ${what} inventory did not fail closed`);
  }
}
