// Case engineering/T1552 tests: engineering/F97
import assert from 'node:assert/strict';
import { load, resolve } from './fixture.mjs';
export const id = 'engineering/T1552';
export const tests = ['engineering/F97'];
export const title = 'the decisions: the Change folder rows are interim and owned by kaal-change, Cases are PLAN, unit tests and baselines DO, control records PLAN, retros ACT, runs unassigned';
export async function run() {
  const areas = load();
  const is = (path, phase) => assert.equal(resolve(areas, path), phase, `${path} is ${phase}`);
  // The Change folder is kaal-change's: three interim rows copy release's current reading until it publishes its layout.
  is('01-changes/C1-x/C1.md', 'PLAN');
  is('01-changes/C1-x/change.md', 'PLAN');
  is('01-changes/C1-x/do.md', 'DO');
  is('01-changes/C1-x/act.md', 'ACT');
  assert.deepEqual(areas.areas.filter((r) => r.path.startsWith('01-changes')).map((r) => [r.owner, r.interim]), [['kaal-change', true], ['kaal-change', true], ['kaal-change', true]], 'the three Change folder rows are interim and kaal-change\'s');
  for (const c of ['10-intent', '11-requirements', '12-architecture', '15-defects']) { is(`${c}/test-cases/T1.test.mjs`, 'PLAN'); is(`${c}/review-items/RV1.md`, 'PLAN'); }
  is('13-source/unit-tests/a.test.mjs', 'DO');
  is('13-source/workflows/w.yml', 'DO');
  is('13-source/review-items/RV1.md', 'DO');
  is('02-learnings/retros/RT1.md', 'ACT');
  for (const f of ['research', 'rehearsals', 'reviews']) is(`02-learnings/${f}/X1.md`, 'PLAN');
  is('14-operations/controls/CTL1-x/CTL1.md', 'PLAN');
  is('14-operations/controls/CTL1-x/baseline.json', 'DO');
  is('14-operations/review-items/RV1.md', 'PLAN');
  is('14-operations/runs/r1.json', undefined);
  is('00-backlog/B1.md', 'PLAN');
  for (const f of ['AGENTS.md', 'README.md', 'LICENSE', 'package.json', 'x.kaal.json']) is(f, 'DO');
  is('10-intent/I1-x/I1.md', 'PLAN');
  is('stray/file.md', undefined);
}
