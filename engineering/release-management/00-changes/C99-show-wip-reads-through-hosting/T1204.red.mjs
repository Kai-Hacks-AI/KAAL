// Case release/T1204 tests: release/C99 (D11). Static: the Dispatcher names no open-pulls route and reads them through Hosting.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
export const id = 'release/T1204';
export const tests = ['release/C99'];
export const title = 'gather.mjs holds no open-pulls route and dispatch.mjs reads open pull requests through Hosting';
export async function run() {
  const dir = new URL('../../05-src/promotion-raise/', import.meta.url);
  const gather = readFileSync(new URL('gather.mjs', dir), 'utf8');
  const dispatch = readFileSync(new URL('dispatch.mjs', dir), 'utf8');
  assert.doesNotMatch(gather, /state=open/);
  assert.match(dispatch, /@kaihacksai\/kaal-hosting/);
  assert.match(dispatch, /readPullRequests/);
}
