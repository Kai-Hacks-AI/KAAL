// Case controls/T1735 tests: controls/F232
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const LANE = join(dir, 'test/lane.mjs');
export const id = 'controls/T1735';
export const tests = ['controls/F232'];
export const title = 'the package test is a lane that passes only when an open PLAN\'s own Case is observed RED and every other Case passes';
const OWN = '02-requirements/F900-a/T900.test.mjs';
const OTHER = '02-requirements/F901-b/T901.test.mjs';
const RED = (name) => `import { describe, it } from 'node:test'; import assert from 'node:assert/strict'; describe('Cases', () => it('${name}', () => assert.equal(1, 2)));\n`;
const GREEN = (name) => `import { describe, it } from 'node:test'; describe('Cases', () => it('${name}', () => {}));\n`;
const ERR = (name) => `import { describe, it } from 'node:test'; describe('Cases', () => it('${name}', () => { throw new Error('before the assertion'); }));\n`;
const put = (root, path, text) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); };
// A fixture package: Change C900 implements I900, F900 serves I900 and T900 tests F900; T901 tests F901, which serves I901 that no Change implements.
const lane = ({ body, reference = 'controls/C900', caseName = OWN, registered = true, act = false }) => {
  const root = mkdtempSync(join(tmpdir(), 'lane-'));
  try {
    put(root, '00-changes/C900-a/C900.md', '---\nid: controls/C900\ntitle: a\nimplements: [controls/I900]\n---\n');
    if (act) put(root, '00-changes/C900-a/act.md', 'done\n');
    put(root, '01-intent/I900-a/I900.md', '---\nid: controls/I900\ntitle: a\n---\n');
    put(root, '02-requirements/F900-a/F900.md', '---\nid: controls/F900\nserves: [controls/I900]\n---\n');
    put(root, OWN, "export const tests = ['controls/F900'];\n");
    put(root, '02-requirements/F901-b/F901.md', '---\nid: controls/F901\nserves: [controls/I901]\n---\n');
    put(root, OTHER, "export const tests = ['controls/F901'];\n");
    put(root, 'test/fixture.test.mjs', body(caseName));
    put(root, 'test/plan-register.json', JSON.stringify({ schema: 'kaal-testing/expected-failures@1', expected: registered ? [{ id: `test/fixture.test.mjs > Cases > ${caseName}`, reference }] : [] }));
    const r = spawnSync(process.execPath, [LANE, '--root', root], { encoding: 'utf8', timeout: 120000 });
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
  const held = lane({ body: RED });
  assert.equal(held.status, 0, held.out); assert.ok(held.out.includes(OWN), 'the held Case is named in the output'); assert.match(held.out, /controls\/C900/, 'its Change is named');
  const green = lane({ body: GREEN });
  assert.equal(green.status, 1); assert.match(green.out, /green:/, 'a PLAN Case that passes early fails the lane');
  const err = lane({ body: ERR });
  assert.equal(err.status, 1); assert.match(err.out, /error:/, 'an error before the assertion fails the lane');
  const unreg = lane({ body: RED, registered: false });
  assert.equal(unreg.status, 1); assert.match(unreg.out, /red:/, 'a red Case nobody registered fails the lane');
  const nochange = lane({ body: RED, reference: 'controls/C999' });
  assert.equal(nochange.status, 1); assert.match(nochange.out, /nochange:/, 'an entry naming a Change that does not exist fails the lane');
  const foreign = lane({ body: RED, caseName: OTHER });
  assert.equal(foreign.status, 1); assert.match(foreign.out, /foreign:/, 'an unrelated failing Case registered against an open Change fails the lane');
  const closed = lane({ body: RED, act: true });
  assert.equal(closed.status, 1); assert.match(closed.out, /closed:/, 'an entry whose Change has its ACT fails the lane');
  const bad = spawnSync(process.execPath, [LANE, '--root', '/nonexistent-root-for-lane', 'x.test.mjs'], { encoding: 'utf8', timeout: 60000 });
  assert.equal(bad.status, 2, 'invalid input is exit 2, never a pass');
}
