// Case engineering/T1222 tests: engineering/F46
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1222';
export const tests = ['engineering/F46'];
export const title = 'the reference gives each concern its own tests: test-cases in four folders, unit-tests in the source';
export async function run() {
  const t = ref();
  const line = (folder) => { const l = t.split('\n').find((x) => x.includes(folder) && /^\s{2}\S/.test(x)); assert.ok(l, `no layout line for ${folder}`); return l; };
  for (const f of ['10-intent', '11-requirements', '12-architecture', '14-defects']) assert.match(line(f), /test-cases/, `${f} carries no test-cases`);
  assert.ok(/unit-tests/.test(t.slice(t.indexOf('13-source'))), '13-source carries no unit-tests');
  assert.match(t, /own tests in its own folder/i, 'the rule that each concern carries its own tests is absent');
  assert.match(t, /prove/i, 'the defect test-cases are not said to prove the defect');
}
