// Case release/T945 tests: release/I40
import assert from 'node:assert/strict';
import { src, read, code, WORKFLOW, repo } from './fixtures.mjs';
import { join } from 'node:path';
export const id = 'release/T945';
export const tests = ['release/I40'];
export const title = 'nothing of the Dispatcher can approve, merge, enable auto-merge, push or edit: its only write is the creation of a pull request';
export async function run() {
  const files = { 'gather.mjs': src('gather.mjs'), 'raise.mjs': src('raise.mjs'), 'dispatch.mjs': src('dispatch.mjs'), 'dispatcher.yml': read(WORKFLOW), 'app-manifest.json': src('app-manifest.json') };
  for (const [n, t] of Object.entries(files)) assert.ok(t.length > 0, `${n} is absent`);
  for (const [n, t] of Object.entries(files)) {
    const c = code(t);
    for (const bad of [/\/reviews/, /\bapprove/i, /\/merge\b/, /merge_method/, /auto_merge|enableAutoMerge|enablePullRequestAutoMerge/, /\bgit\s+push\b/, /\b(PUT|PATCH|DELETE)\b/, /git\/refs/, /\bgraphql\b/i]) assert.ok(!bad.test(c), `${n} holds ${bad}`);
  }
  assert.equal([...code(files['raise.mjs']).matchAll(/'POST'/g)].length, 1, 'raise.mjs makes other than one kind of write');
  const d = code(files['dispatch.mjs']);
  assert.ok(/POST/.test(d) && /pulls/.test(d), 'dispatch.mjs does not state its one write');
  assert.ok(!/GH_TOKEN[^\n]*secrets\./.test(code(files['dispatcher.yml'])), 'the secret reaches a token variable directly');
}
