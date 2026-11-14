// Case pull/T41 tests: pull/F40
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T41';
export const tests = ['pull/F40'];
export const title = 'the lane function returns only advisory actions: never an approval or a merge';

export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  assert.equal(typeof mod.laneStep, 'function', 'laneStep is not exported');
  const allowed = new Set(['wait', 'judge', 'open-promotion', 'open-sync', 'ready-for-cpo']);
  const reports = [
    { qualifiers: [], next: { collector: null, reason: 'none' } },
    { qualifiers: ['col-a'], next: { collector: 'col-a' } },
    { qualifiers: ['col-a', 'col-b'], next: { collector: null, judged: ['col-a', 'col-b'], reason: 'judged' } },
  ];
  let n = 0;
  for (const seat of [null, { collector: 'col-a', pr: 1 }])
    for (const behind of [true, false])
      for (const requalification of ['PASS', 'FAIL', 'UNKNOWN', undefined])
        for (const report of reports) {
          const r = mod.laneStep({ seat, behind, requalification, report });
          assert.ok(allowed.has(r.action), `unexpected action ${r.action}`);
          assert.ok(!/approv|merge/i.test(JSON.stringify(r)), 'the result mentions an approval or a merge');
          n += 1;
        }
  assert.equal(n, 48, 'not every combination was run');
}
