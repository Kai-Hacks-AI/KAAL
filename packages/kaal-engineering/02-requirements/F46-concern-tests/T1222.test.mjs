// Case engineering/T1222 tests: engineering/F46
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const dir = join(pkg, 'skills/kaal-engineering');
const template = () => { const f = join(dir, 'references/package-layout.json'); assert.ok(existsSync(f), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(f, 'utf8')); };
const folder = (t, n) => t.folders.find((f) => f.name === n);
export const id = 'engineering/T1222';
export const tests = ['engineering/F46'];
export const title = 'each element folder and the source name a verifying child that they hold';
export async function run() {
  const t = template();
  for (const e of ['intent', 'requirement', 'architecture', 'defect']) {
    const f = t.folders.find((x) => x.element === e);
    assert.ok(f, `no folder for ${e}`);
    assert.equal(f.verifiedBy, 'test-cases', `${e} is not verified by test-cases`);
    assert.ok(f.children.includes(f.verifiedBy), `${f.name} does not hold ${f.verifiedBy}`);
  }
  const s = folder(t, '13-source');
  assert.equal(s.verifiedBy, 'unit-tests');
  assert.ok(s.children.includes('unit-tests'), '13-source does not hold unit-tests');
}
