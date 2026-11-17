// Case project/T822 tests: project/G92
import assert from 'node:assert/strict';
import { fm, load, project } from './lib.mjs';
export const id = 'project/T822';
export const tests = ['project/G92'];
export const title = 'one-way: a delivered Change that names its Project is a finding';
export async function run() {
  const { checkProject } = await load();
  const clean = { 'release/C1': fm('release/C1') };
  assert.equal(checkProject(project('release/C1'), clean).ok, true);
  for (const leak of [fm('release/C1', 'project: project/P9\n'), fm('release/C1') + 'Part of project/P9.\n']) {
    const r = checkProject(project('release/C1'), { 'release/C1': leak });
    assert.equal(r.ok, false, 'a Change that knows its Project must fail');
  }
}
