// Case engineering/T1623 tests: engineering/F102
import assert from 'node:assert/strict';
import { source } from './fixture.mjs';
export const id = 'engineering/T1623';
export const tests = ['engineering/F102'];
export const title = 'the workflow sources call judge-run with the arguments they gave judge-mode, and no longer call the controls script';
export async function run() {
  const calls = (text) => [...text.matchAll(/node \S*(judge-mode|judge-run)\.mjs (.*)/g)].map((m) => ({ which: m[1], args: m[2].trim() }));
  const codeql = calls(source('codeql.yml'));
  const names = calls(source('verify-workflow-names.yml'));
  assert.equal(codeql.length, 2, 'codeql.yml does not call the judge twice');
  assert.equal(names.length, 1, 'verify-workflow-names.yml does not call the judge once');
  for (const c of [...codeql, ...names]) assert.equal(c.which, 'judge-run', 'a workflow still calls judge-mode.mjs');
  for (const c of codeql) assert.match(c.args, /^--mode preventive --findings "\$RUNNER_TEMP\/findings\.json"$/);
  assert.match(names[0].args, /^--mode ratchet --findings "\$RUNNER_TEMP\/findings\.json" --baseline \S+ --previous \S+$/);
}
