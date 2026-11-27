// Case testing/T421 tests: testing/F177
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C84-evidence-examined-content/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T421';
export const tests = ['testing/F177'];
export const title = 'testing/F177 states the check of the examined identity and its use in the observation record, equal to its draft';

export async function run() {
  const real = join(ET, '11-requirements/F177-identity/F177.md');
  assert.ok(existsSync(real), 'F177.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('F177.md')}\n`, 'F177.md differs from the draft');
  assert.match(text, /^id: testing\/F177$/m);
}
