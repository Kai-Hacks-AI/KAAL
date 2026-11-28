// Case controls/T1735 tests: controls/F232
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const LANE = join(dir, 'test/lane.mjs');
export const id = 'controls/T1735';
export const tests = ['controls/F232'];
export const title = 'the package test is a lane that passes only when a PLAN Case is observed RED and every other Case passes';
const RED = "import test from 'node:test'; import assert from 'node:assert/strict'; test('plan', () => assert.equal(1, 2));\n";
const GREEN = "import test from 'node:test'; test('plan', () => {});\n";
const ERR = "import test from 'node:test'; test('plan', () => { throw new Error('before the assertion'); });\n";
const OTHER = "import test from 'node:test'; test('other', () => {});\n";
const lane = (body, reg) => {
  const root = mkdtempSync(join(tmpdir(), 'lane-'));
  try {
    writeFileSync(join(root, 'plan.test.mjs'), body);
    writeFileSync(join(root, 'other.test.mjs'), OTHER);
    writeFileSync(join(root, 'register.json'), JSON.stringify({ schema: 'kaal-testing/expected-failures@1', expected: reg.map((i) => ({ id: i, reference: 'controls/C900' })) }));
    const r = spawnSync(process.execPath, [LANE, '--root', root, '--register', join(root, 'register.json'), 'plan.test.mjs', 'other.test.mjs'], { encoding: 'utf8', timeout: 120000 });
    return { status: r.status, out: `${r.stdout}${r.stderr}` };
  } finally { rmSync(root, { recursive: true, force: true }); }
};
export async function run() {
  assert.ok(existsSync(LANE), 'test/lane.mjs is absent');
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  assert.match(pkg.scripts.test, /test\/lane\.mjs/, 'npm test is not the lane');
  assert.ok(pkg.devDependencies?.['kaal-testing'], 'kaal-testing is not a dev dependency');
  assert.ok(!(pkg.dependencies ?? {})['kaal-testing'], 'kaal-testing must not be a runtime dependency');
  const reg = JSON.parse(readFileSync(join(dir, 'test/plan-register.json'), 'utf8'));
  assert.equal(reg.schema, 'kaal-testing/expected-failures@1');
  assert.ok(Array.isArray(reg.expected));
  const held = lane(RED, ['plan.test.mjs > plan']);
  assert.equal(held.status, 0, held.out); assert.match(held.out, /plan\.test\.mjs > plan/, 'the held Case is named in the output'); assert.match(held.out, /controls\/C900/, 'its Change is named');
  const green = lane(GREEN, ['plan.test.mjs > plan']);
  assert.equal(green.status, 1); assert.match(green.out, /green:plan\.test\.mjs > plan/, 'a PLAN Case that passes early fails the lane');
  const err = lane(ERR, ['plan.test.mjs > plan']);
  assert.equal(err.status, 1); assert.match(err.out, /error:plan\.test\.mjs > plan/, 'an error before the assertion fails the lane');
  const unreg = lane(RED, []);
  assert.equal(unreg.status, 1); assert.match(unreg.out, /red:plan\.test\.mjs > plan/, 'a red Case nobody registered fails the lane');
  const bad = spawnSync(process.execPath, [LANE, '--root', '/nonexistent-root-for-lane', 'x.test.mjs'], { encoding: 'utf8', timeout: 60000 });
  assert.equal(bad.status, 2, 'invalid input is exit 2, never a pass');
}
