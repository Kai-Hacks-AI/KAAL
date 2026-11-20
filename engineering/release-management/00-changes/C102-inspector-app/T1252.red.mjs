// Case release/T1252 tests: release/A70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const draft = (name) => readFileSync(join(RM, '00-changes/C102-inspector-app/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1252';
export const tests = ['release/A70'];
export const title = 'release/A70 addresses release/F79 and names the manifest and the workflow source, equal to its draft';
export async function run() {
  const real = join(RM, '03-architecture/A70-inspector-app-manifest-and-workflow/A70.md');
  assert.ok(existsSync(real), 'A70.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('A70.md')}\n`, 'A70.md differs from the draft');
  assert.match(t, /addresses: \[release\/F79\]/);
  assert.match(t, /05-src\/inspector\/app\.json/);
  assert.match(t, /never of the change/);
}
