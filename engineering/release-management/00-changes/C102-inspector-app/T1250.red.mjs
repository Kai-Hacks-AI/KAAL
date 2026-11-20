// Case release/T1250 tests: release/I55
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const draft = (name) => readFileSync(join(RM, '00-changes/C102-inspector-app/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1250';
export const tests = ['release/I55'];
export const title = 'release/I55 states the contract of least privilege and a judge without the key, with release management as owner, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I55-inspector-least-privilege/I55.md');
  assert.ok(existsSync(real), 'I55.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I55.md')}\n`, 'I55.md differs from the draft');
  assert.match(t, /^id: release\/I55$/m);
  assert.match(t, /the judge never holds the key/);
  assert.match(t, /Owner: release management/);
}
