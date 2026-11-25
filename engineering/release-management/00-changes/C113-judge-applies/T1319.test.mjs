// Case release/T1319 tests: release/F88
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const PHASE = join(RM, '05-src/phase');
const use = (name) => { const f = join(PHASE, name); assert.ok(existsSync(f), `${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1319';
export const tests = ['release/F88'];
export const title = 'limit Act says whether it had anything to judge: Given the changed paths, the write map and the roots, When it judges, Then PASS applies only for a pull request that is an ACT, and FAIL and UNKNOWN always apply';
export async function run() {
  const { judgeLimitAct } = await use('judge-limit-act.mjs');
  const map = [{ route: 'act', folders: ['02-learnings/retros/'], files: ['00-changes/*/act.md'] }];
  const roots = ['engineering/release-management'];
  const RT = 'engineering/release-management/02-learnings/retros/RT9.md';
  const verdictOf = (r) => [r.verdict, r.applies];
  // Given a pull request that touches no ACT folder, Then it is not an ACT: PASS with nothing to judge.
  assert.deepEqual(verdictOf(judgeLimitAct({ changed: ['engineering/release-management/05-src/x.mjs'], map, roots })), ['PASS', false]);
  assert.deepEqual(verdictOf(judgeLimitAct({ changed: [], map, roots })), ['PASS', false]);
  // Given an ACT that writes only its folders, Then PASS and it applies.
  assert.deepEqual(verdictOf(judgeLimitAct({ changed: [RT], map, roots })), ['PASS', true]);
  // Given an ACT with one path outside, Then FAIL, which applies, naming it.
  const outside = judgeLimitAct({ changed: [RT, 'engineering/release-management/05-src/x.mjs'], map, roots });
  assert.deepEqual(verdictOf(outside), ['FAIL', true]);
  assert.deepEqual(outside.outside, ['engineering/release-management/05-src/x.mjs']);
  // Given facts it cannot read, Then UNKNOWN, which applies.
  assert.deepEqual(verdictOf(judgeLimitAct({ changed: 'x', map, roots })), ['UNKNOWN', true]);
  assert.deepEqual(verdictOf(judgeLimitAct({ changed: [RT], map: [], roots })), ['UNKNOWN', true]);
}
