// Case release/T193 tests: F16
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const f16 = join(repo, 'engineering/release-management/02-requirements/F16-hotfix-interface/F16.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T193';
export const tests = ['release/F16'];
export const title = 'the Defect chapter references a KAAL Defect by its identity, a GitHub issue or URL is not that identity, and the reference stays out of Urgency and Approach';
export function run() {
  const text = read(f16, 'F16');
  const defect = text.split('\n').find((line) => line.startsWith('- Defect:')) ?? '';
  assert.ok(defect, 'F16 has no Defect line');
  assert.ok(/KAAL Defect/.test(defect), 'the Defect line does not require a KAAL Defect');
  assert.ok(/<capability>\/D<n>/.test(defect), 'the Defect line does not give the identity form <capability>/D<n>');
  assert.ok(/GitHub issue or (a )?URL is not/i.test(defect), 'the Defect line does not say that a GitHub issue or URL is not the identity');
  for (const name of ['Urgency', 'Approach']) {
    const line = text.split('\n').find((l) => l.startsWith(`- ${name}:`)) ?? '';
    assert.ok(line && !/KAAL Defect/.test(line), `the ${name} line must not carry the Defect reference`);
  }
}
