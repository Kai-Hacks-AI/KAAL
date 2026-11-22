// Case engineering/T1382 tests: engineering/F91
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GOOD, fixture, judge, template, findings } from './fixture.mjs';
export const id = 'engineering/T1382';
export const tests = ['engineering/F91'];
export const title = 'what is required is data in the template: marking one more folder required makes its absence FAIL, with no change of the check';
export async function run() {
  const t = template();
  assert.ok(t.folders.filter((f) => f.required).length > 0, 'the template marks no folder required');
  const copy = JSON.parse(JSON.stringify(t));
  copy.folders.find((f) => f.name === '15-defects').required = true;
  const path = join(mkdtempSync(join(tmpdir(), 'tpl-')), 'package-layout.json');
  writeFileSync(path, JSON.stringify(copy));
  const r = judge(fixture(GOOD), path);
  assert.equal(r.code, 1, 'a folder without a folder the template now requires is not FAIL');
  assert.deepEqual(findings(r.out), ['15-defects is missing'], `the one fault is not named: ${r.out}`);
  assert.equal(judge(fixture(GOOD)).code, 0, 'the real template faults a folder with every required part');
}
