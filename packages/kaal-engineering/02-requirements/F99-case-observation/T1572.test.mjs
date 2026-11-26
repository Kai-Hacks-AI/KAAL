// Case engineering/T1572 tests: engineering/F99
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1572';
export const tests = ['engineering/F99'];
export const title = 'the job uploads artifact case-observation holding observation.json, even when the run is red';
export async function run() {
  const y = load();
  const up = y.match(/upload-artifact@[\s\S]*?(?=\n\s*- |\n\S|$)/);
  assert.ok(up, 'it uploads an artifact');
  assert.ok(/name:\s*case-observation\b/.test(up[0]), 'artifact name case-observation');
  assert.ok(/observation\.json/.test(y), 'the file is observation.json');
  const stepStart = y.lastIndexOf('\n', y.indexOf(up[0])); void stepStart;
  assert.ok(/if:\s*always\(\)/.test(y), 'upload runs always');
}
