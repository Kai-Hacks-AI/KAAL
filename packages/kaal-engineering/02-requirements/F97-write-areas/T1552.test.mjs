// Case engineering/T1552 tests: engineering/F97
import assert from 'node:assert/strict';
import { load, resolve } from './fixture.mjs';
export const id = 'engineering/T1552';
export const tests = ['engineering/F97'];
export const title = 'the decisions: a Change folder is split by phase, Cases are PLAN, unit tests and baselines DO, control records PLAN, retros ACT, runs unassigned';
export async function run() {
  const areas = load();
  const is = (path, phase) => assert.equal(resolve(areas, path), phase, `${path} is ${phase}`);
  is('01-changes/C1-x/C1.md', 'PLAN');
  for (const f of ['change.md', 'gap.md', 'baseline.md', 'T1.red.mjs', 'T1.test.mjs']) is(`01-changes/C1-x/plan/${f}`, 'PLAN');
  is('01-changes/C1-x/do/do.md', 'DO');
  is('01-changes/C1-x/check/evidence.md', 'CHECK');
  is('01-changes/C1-x/act/act.md', 'ACT');
  // Changes already in flight keep their flat files, by two rows marked legacy.
  is('01-changes/C1-x/do.md', 'DO');
  is('01-changes/C1-x/act.md', 'ACT');
  assert.deepEqual(areas.areas.filter((r) => r.legacy).map((r) => r.path).sort(), ['01-changes/*/act.md', '01-changes/*/do.md'], 'only the two flat files are legacy rows');
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
