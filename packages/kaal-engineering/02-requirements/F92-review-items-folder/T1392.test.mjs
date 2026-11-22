// Case engineering/T1392 tests: engineering/F92
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GOOD, fixture, judge, pkg } from '../F91-layout-complete/fixture.mjs';
export const id = 'engineering/T1392';
export const tests = ['engineering/F92'];
export const title = 'a package with review-items beside every kind of subject is PASS, and so is one with none; the layout document says what the folder holds';
export async function run() {
  const items = ['10-intent', '11-requirements', '12-architecture', '13-source', '14-operations', '15-defects'].map((d) => `${d}/review-items/V1.md`);
  assert.equal(judge(fixture([...GOOD, '15-defects/test-cases/T4.test.mjs', ...items])).code, 0, 'review-items is faulted');
  assert.equal(judge(fixture(GOOD)).code, 0, 'a package with no review-items is faulted');
  const doc = readFileSync(join(pkg, 'skills/kaal-engineering/references/package-layout.md'), 'utf8');
  assert.ok(/review-items/.test(doc) && /Review item/.test(doc), 'package-layout.md does not say what review-items holds');
}
