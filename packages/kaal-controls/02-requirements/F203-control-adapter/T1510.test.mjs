// Case controls/T1510 tests: controls/F203
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const B = { x: 'real', run: 'r1', sha: 'abc' };
export const id = 'controls/T1510';
export const tests = ['controls/F203'];
export const title = 'a run leaves one log line and one record, the record only when the run can be identified, and neither carries a date';
export async function run() {
  const { runControl } = await load();
  const r = await runControl({ id: 'c/CTL1', mode: 'preventive', check: () => ['a'], input: {}, boundary: B });
  assert.deepEqual(r.log, { control: 'c/CTL1', mode: 'preventive', verdict: 'FAIL', findings: 1, run: 'r1', sha: 'abc', flag: { name: null, value: null, state: 'UNKNOWN' } });
  assert.deepEqual(r.record, { control: 'c/CTL1', x: 'real', run: 'r1', sha: 'abc', verdict: 'FAIL', by: 'adapter', mode: 'preventive', applied: null, flag: { name: null, value: null, state: 'UNKNOWN' } });
  for (const part of ['x', 'run', 'sha']) {
    const b = { ...B }; delete b[part];
    const q = await runControl({ id: 'c/CTL1', mode: 'detective', check: () => [], input: {}, boundary: b });
    assert.equal(q.record, null, `a run without ${part} left a record`);
  }
  assert.equal((await runControl({ id: 'c/CTL1', mode: 'detective', check: () => [], input: {} })).record, null);
  assert.ok(!/\d{4}-\d{2}-\d{2}/.test(JSON.stringify([r.log, r.record])), 'a date was written');
  let calls = 0;
  await runControl({ id: 'c/CTL1', mode: 'detective', check: () => { calls += 1; return []; }, input: {}, boundary: B });
  assert.equal(calls, 1, 'the check was not called exactly once');
}
