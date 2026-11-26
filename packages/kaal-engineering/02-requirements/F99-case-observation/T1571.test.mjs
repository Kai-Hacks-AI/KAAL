// Case engineering/T1571 tests: engineering/F99
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1571';
export const tests = ['engineering/F99'];
export const title = 'the call is kaal-testing observe-at with its inputs, in one step';
export async function run() {
  const y = load();
  const calls = y.match(/kaal-testing[^\n]*observe-at[\s\S]*?(?=\n\s*- |\n\S|$)/g) ?? [];
  assert.equal(calls.length, 1, 'one observe-at step');
  for (const f of ['--root', '--revision', '--expect-revision', '--run-id', '--produced-by pull-request', '--out']) assert.ok(calls[0].includes(f), `observe-at needs ${f}`);
}
