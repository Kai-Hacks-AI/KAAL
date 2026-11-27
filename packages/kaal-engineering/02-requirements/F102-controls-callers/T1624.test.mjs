// Case engineering/T1624 tests: engineering/F102
import assert from 'node:assert/strict';
import { source, live } from './fixture.mjs';
export const id = 'engineering/T1624';
export const tests = ['engineering/F102'];
export const title = 'apart from the judge calls and the install and build steps each workflow source is the live workflow';
export async function run() {
  const strip = (t) => t
    .split('\n')
    .filter((l) => !/judge-(mode|run)\.mjs/.test(l))
    .filter((l) => !/npm ci --ignore-scripts|npm run build -w @kaihacksai\/kaal-hosting/.test(l))
    .filter((l, i, all) => !(/^\s*- name: (Install|Build) /.test(l) && /^\s*run:/.test(all[i + 1] ?? '') && /npm /.test(all[i + 1])))
    .join('\n');
  for (const name of ['codeql.yml', 'verify-workflow-names.yml']) {
    assert.equal(strip(source(name)), strip(live(name)), `${name} differs from the live workflow outside the judge calls and the install steps`);
  }
}
