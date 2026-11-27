// Case testing/T409 tests: testing/F175
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C82-observe-cases-at-revision/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T409';
export const tests = ['testing/F175'];
export const title = 'testing/F175 states the observation record, its integrity check and the command, equal to its draft';

export async function run() {
  const real = join(ET, '11-requirements/F175-observe-at/F175.md');
  assert.ok(existsSync(real), 'F175.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('F175.md')}\n`, 'F175.md differs from the draft');
  assert.match(text, /^id: testing\/F175$/m);
}
