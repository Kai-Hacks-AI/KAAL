// Case controls/T1532 tests: controls/F204
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
export const id = 'controls/T1532';
export const tests = ['controls/F204'];
export const title = 'executed never matches an invalid control or revision against a record that carries the same invalid value, and establishes a run only for the exact control, run and revision';
export async function run() {
  const { executed } = await load();
  const rec = (o = {}) => ({ control: 'c/CTL1', x: 'real', run: 'r1', sha: 'abc', verdict: 'PASS', by: 'adapter', ...o });
  const est = (o = {}) => ({ control: 'c/CTL1', run: 'r1', sha: 'abc', ...o });
  assert.equal(executed({ id: 'c/CTL1', records: [rec()], revision: 'abc', established: [est()] }), true);
  for (const bad of [undefined, null, '', 7, {}, ['c/CTL1']]) {
    assert.throws(() => executed({ id: bad, records: [rec({ control: bad })], revision: 'abc', established: [est({ control: bad })] }), `an invalid id was matched: ${JSON.stringify(bad)}`);
    assert.throws(() => executed({ id: 'c/CTL1', records: [rec({ sha: bad })], revision: bad, established: [est({ sha: bad })] }), `an invalid revision was matched: ${JSON.stringify(bad)}`);
  }
  assert.throws(() => executed({ records: [rec()], revision: 'abc', established: [est()] }), 'a missing id was accepted');
  assert.throws(() => executed({ id: 'c/CTL1', records: [rec()], established: [est()] }), 'a missing revision was accepted');
  // exact control, run and revision
  assert.equal(executed({ id: 'c/CTL1', records: [rec()], revision: 'abc', established: [est({ run: 'other' })] }), null, 'another run established this one');
  assert.equal(executed({ id: 'c/CTL1', records: [rec()], revision: 'abc', established: [est({ control: 'c/CTL2' })] }), null, 'another control established this one');
  assert.equal(executed({ id: 'c/CTL1', records: [rec()], revision: 'abc', established: [est({ sha: 'other' })] }), null, 'another revision established this one');
}
