// Case project/T821 tests: project/G92
import assert from 'node:assert/strict';
import { fm, load, project } from './lib.mjs';
export const id = 'project/T821';
export const tests = ['project/G92'];
export const title = 'a malformed Project is a finding, never a pass';
export async function run() {
  const { checkProject } = await load();
  const changes = { 'release/C1': fm('release/C1'), 'controls/C2': fm('controls/C2') };
  assert.equal(checkProject(project('release/C1, controls/C2'), changes).ok, true, 'a well-formed Project passes');
  for (const bad of ['', 'release/C1, release/C1', 'release/C1, nonsense', 'release/C1, controls/C9']) {
    const r = checkProject(project(bad), changes);
    assert.equal(r.ok, false, `delivers [${bad}] must fail`);
    assert.ok(r.findings.length > 0, `delivers [${bad}] must say why`);
  }
}
