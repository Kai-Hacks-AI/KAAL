// Case engineering/T1552 tests: engineering/F97
import assert from 'node:assert/strict';
import { load, resolve } from './fixture.mjs';
export const id = 'engineering/T1552';
export const tests = ['engineering/F97'];
export const title = 'the decisions: the Change folder is delegated to kaal-change, Cases are PLAN, unit tests DO, baselines an allowance transition of Controls, control records PLAN, retros ACT, runs unassigned';
export async function run() {
  const areas = load();
  const is = (path, phase) => assert.equal(resolve(areas, path), phase, `${path} is ${phase}`);
  // The Change folder is delegated whole to kaal-change; there is no do.md or act.md row.
  for (const f of ['C1.md', 'change.md', 'do.md', 'act.md', 'plan/change.md', 'do/do.md']) is(`01-changes/C1-x/${f}`, 'delegated:kaal-change');
  assert.ok(!areas.areas.some((r) => /do\.md|act\.md/.test(r.path)), 'no row names do.md or act.md');
  for (const c of ['10-intent', '11-requirements', '12-architecture', '15-defects']) { is(`${c}/test-cases/T1.test.mjs`, 'PLAN'); is(`${c}/review-items/RV1.md`, 'PLAN'); }
  is('13-source/unit-tests/a.test.mjs', 'DO');
  is('13-source/workflows/w.yml', 'DO');
  is('13-source/review-items/RV1.md', 'DO');
  is('02-learnings/retros/RT1.md', 'ACT');
  for (const f of ['research', 'rehearsals', 'reviews']) is(`02-learnings/${f}/X1.md`, 'PLAN');
  is('14-operations/controls/CTL1-x/CTL1.md', 'PLAN');
  is('14-operations/controls/CTL1-x/baseline.json', 'transition:controls');
  is('14-operations/review-items/RV1.md', 'PLAN');
  is('14-operations/runs/r1.json', undefined);
  is('00-backlog/B1.md', 'PLAN');
  for (const f of ['AGENTS.md', 'README.md', 'LICENSE', 'package.json', 'x.kaal.json']) is(f, 'DO');
  is('10-intent/I1-x/I1.md', 'PLAN');
  is('stray/file.md', undefined);
}
