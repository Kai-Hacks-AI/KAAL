// Case release/T195 tests: G55
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T195';
export const tests = ['release/G55'];
export const title = 'gap release/G55 is closed: F16 and the template draft require a KAAL Defect identity';
export function run() {
  const f16 = read(join(cap, '02-requirements/F16-hotfix-interface/F16.md'), 'F16');
  const draft = read(join(cap, '00-changes/C11-hotfix/interface.md'), 'the Hotfix interface').split(/^## Draft of the template$/m)[1] ?? '';
  for (const [text, what] of [[f16, 'F16'], [draft, 'the template draft']]) {
    assert.ok(/KAAL Defect/.test(text), `${what} does not name a KAAL Defect`);
  }
}
