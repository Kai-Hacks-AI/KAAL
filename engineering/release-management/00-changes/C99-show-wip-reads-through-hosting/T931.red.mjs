// Case release/T931 tests: release/C99. Feature: the open-piece read knows no route and starts no process; Hosting does the reaching.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIR } from './helper.mjs';
export const id = 'release/T931';
export const tests = ['release/C99'];
export const title = 'the open-piece read of Show WIP names no GitHub route and starts no process, and takes its pieces from @kaihacksai/kaal-hosting';
export async function run() {
  const read = readFileSync(join(DIR, 'read.mjs'), 'utf8');
  const start = read.indexOf('export async function readOpenPulls');
  assert.ok(start >= 0, 'readOpenPulls is missing from read.mjs');
  const body = read.slice(start, read.indexOf('\n}\n', start));
  assert.ok(!/graphql|\/ccr\/|execFileSync|spawn|child_process/i.test(body), 'readOpenPulls names a GitHub route or starts a process');
  assert.ok(!/graphql\(|query\(\$owner/i.test(read), 'read.mjs still holds the GraphQL query');
  assert.match(read, /@kaihacksai\/kaal-hosting/, 'read.mjs does not use Hosting for the open pieces');
}
