// Case release/T861 tests: release/I36
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T861';
export const tests = ['release/I36'];
export const title = 'the Intent release/I36 exists, equal to its draft';
export async function run() {
  const draft = readFileSync(join(RM, '00-changes/C66-integration-approval/interface.md'), 'utf8').split(/^## Draft of I36\.md$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
  const real = join(RM, '01-intent/I36-integration-merge-needs-approval/I36.md');
  assert.ok(existsSync(real), 'I36.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'I36.md differs from the draft');
}
