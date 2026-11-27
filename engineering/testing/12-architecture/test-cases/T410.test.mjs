// Case testing/T410 tests: testing/A61
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

export const id = 'testing/T410';
export const tests = ['testing/A61'];
export const title = 'testing/A61 composes run, catalog and observe into one record and keeps consumers out of Testing, equal to its draft';

export async function run() {
  const real = join(ET, '12-architecture/A61-observe-at/A61.md');
  assert.ok(existsSync(real), 'A61.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('A61.md')}\n`, 'A61.md differs from the draft');
  assert.match(text, /^id: testing\/A61$/m);
}
