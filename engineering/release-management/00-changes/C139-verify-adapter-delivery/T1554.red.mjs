// Case release/T1554 tests: release/C139
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RUNNER = join(repo, 'engineering/release-management/05-src/adapter/run-verify-adapter.mjs');
export const id = 'release/T1554';
export const tests = ['release/C139'];
export const title = 'the runner of verify Adapter reads each delivered entry of the merge result from files, says unadapted only for a confirmed entry, UNKNOWN for what it cannot read, and exits 1 only for a flag that is exactly on';
export async function run() {
  assert.ok(existsSync(RUNNER), 'the runner is absent');
  const dir = mkdtempSync(join(tmpdir(), 'adapter-'));
  const put = (rel, text) => { mkdirSync(join(dir, rel, '..'), { recursive: true }); writeFileSync(join(dir, rel), text); };
  const map = (rows, notControls = []) => put('map.json', JSON.stringify({ rows, notControls }));
  put('pr/e/adapted.mjs', "import { runControl } from './adapter.mjs';\nawait runControl({ id: 'x/CTL1' });\n");
  put('pr/e/plain.mjs', 'console.log("PASS");\n');
  put('pr/.github/workflows/a.yml', 'name: a\n');
  const go = (flag) => spawnSync(process.execPath, [RUNNER, '--map', join(dir, 'map.json'), '--pr', join(dir, 'pr')], { encoding: 'utf8', env: { PATH: process.env.PATH, ...(flag === undefined ? {} : { KAAL_FLAG: flag }), KAAL_PR: '7', KAAL_RUN_ID: '9' } });

  map([{ control: 'x/CTL1', entry: 'e/adapted.mjs' }], [{ path: '.github/workflows/a.yml', reason: 'not a control' }]);
  let r = go('on');
  assert.match(r.stdout, /^PASS: /m, r.stdout); assert.equal(r.status, 0);
  assert.match(r.stdout, /^adapter-evidence \{.*"pr":7.*"verdict":"PASS"/m);

  map([{ control: 'x/CTL1', entry: 'e/adapted.mjs' }, { control: 'x/CTL2', entry: 'e/plain.mjs' }], [{ path: '.github/workflows/a.yml', reason: 'not a control' }]);
  r = go('on'); // a confirmed nonconformance
  assert.match(r.stdout, /^FAIL: /m); assert.match(r.stdout, /unadapted:x\/CTL2/); assert.doesNotMatch(r.stdout, /unadapted:x\/CTL1/); assert.equal(r.status, 1);
  assert.equal(go('ON').status, 0, 'only exactly on is live');
  assert.equal(go(undefined).status, 0, 'no flag is detective');

  map([{ control: 'x/CTL1', entry: 'e/absent.mjs' }], [{ path: '.github/workflows/a.yml', reason: 'not a control' }]);
  r = go('on'); // an entry that cannot be read is never "not adapted" and never a pass
  assert.match(r.stdout, /^UNKNOWN: /m); assert.doesNotMatch(r.stdout, /unadapted:/); assert.equal(r.status, 1);

  map([{ control: 'x/CTL1', entry: 'e/adapted.mjs' }]);
  r = go('on'); // a delivered file that nothing claims
  assert.match(r.stdout, /^UNKNOWN: /m); assert.match(r.stdout, /\.github\/workflows\/a\.yml/); assert.equal(r.status, 1);
}
