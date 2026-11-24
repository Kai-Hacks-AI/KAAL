// Case engineering/T1417 tests: engineering/F95
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, runs } from './fixture.mjs';
export const id = 'engineering/T1417';
export const tests = ['engineering/F95'];
export const title = 'the judge runs first and an absent judge exits 2, then judge-mode in ratchet mode with the head\'s baseline as candidate and the base\'s as accepted';
export async function run() {
  const all = runs(readFileSync(src, 'utf8')).join('\n');
  const judge = all.indexOf('judge-workflow-names.mjs');
  const mode = all.indexOf('judge-mode.mjs');
  assert.ok(judge >= 0 && mode > judge, 'the judge does not run before judge-mode');
  assert.match(all, /J=engineering\/release-management\/05-src\/workflow-names\/judge-workflow-names\.mjs/, 'the judge is not the one of release on the base');
  assert.match(all, /node "\$J" --head \S+ --out \S+/, 'the judge is not run with --head and --out');
  assert.match(all, /test -f "\$J" \|\| \{[^}]*exit 2/, 'an absent judge does not exit 2');
  assert.match(all, /judge-mode\.mjs --mode ratchet --findings \S+ --baseline \S*head\S*CTL36-verify-workflow-names\/baseline\.json"? --previous engineering\/release-management\/04-controls\/CTL36-verify-workflow-names\/baseline\.json/, 'judge-mode is not run in ratchet mode with the head baseline as candidate and the base baseline as accepted');
}
