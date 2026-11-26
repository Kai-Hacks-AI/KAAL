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
export const title = 'the runner of verify Adapter reads each delivered entry of the merge result from files, says PASS only when every delivered control integrates the adapter, UNKNOWN naming the rest and what it cannot read, and never FAIL from structure, and exits 1 only for a flag that is exactly on';
export async function run() {
  assert.ok(existsSync(RUNNER), 'the runner is absent');
  const dir = mkdtempSync(join(tmpdir(), 'adapter-'));
  const put = (rel, text) => { mkdirSync(join(dir, rel, '..'), { recursive: true }); writeFileSync(join(dir, rel), text); };
  const map = (rows, notControls = []) => put('map.json', JSON.stringify({ rows, notControls }));
  const A = '.github/workflows/a.yml';
  const BUILD = { path: '.github/workflows/build.yml', reason: 'checks out, builds and publishes; runs no judge' };
  put('pr/e/adapted.mjs', "import { runControl } from './adapter.mjs';\nawait runControl({ id: 'x/CTL1' });\n");
  put('pr/e/plain.mjs', 'console.log("PASS");\n');
  put('pr/.github/workflows/a.yml', 'name: a\njobs:\n  j:\n    steps:\n      - run: node e/adapted.mjs\n      - run: node e/plain.mjs\n');
  put('pr/.github/workflows/build.yml', 'name: build\njobs:\n  j:\n    steps:\n      - run: echo building\n');
  const go = (flag) => spawnSync(process.execPath, [RUNNER, '--map', join(dir, 'map.json'), '--pr', join(dir, 'pr')], { encoding: 'utf8', env: { PATH: process.env.PATH, ...(flag === undefined ? {} : { KAAL_FLAG: flag }), KAAL_PR: '7', KAAL_RUN_ID: '9' } });

  map([{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }], [BUILD]);
  let r = go('on');
  assert.match(r.stdout, /^PASS: /m, r.stdout); assert.equal(r.status, 0);
  assert.match(r.stdout, /^adapter-evidence \{.*"pr":7.*"verdict":"PASS"/m);

  map([{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }, { control: 'x/CTL2', delivered: A, entry: 'e/plain.mjs' }], [BUILD]);
  r = go('on'); // no recognizable integration is unknown, never a FAIL and never an unadapted finding
  assert.match(r.stdout, /^UNKNOWN: /m); assert.match(r.stdout, /x\/CTL2/); assert.doesNotMatch(r.stdout, /^FAIL: /m); assert.doesNotMatch(r.stdout, /unadapted:/); assert.equal(r.status, 1);
  assert.equal(go('ON').status, 0, 'only exactly on is live');
  assert.equal(go(undefined).status, 0, 'no flag is detective');

  map([{ control: 'x/CTL1', delivered: A, entry: 'e/absent.mjs' }], [BUILD]);
  r = go('on'); // an entry that cannot be read is never "not adapted" and never a pass
  assert.match(r.stdout, /^UNKNOWN: /m); assert.doesNotMatch(r.stdout, /unadapted:/); assert.equal(r.status, 1);

  map([{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }]);
  r = go('on'); // a delivered file that nothing claims
  assert.match(r.stdout, /^UNKNOWN: /m); assert.match(r.stdout, /build\.yml/); assert.equal(r.status, 1);

  // Negative: a compliant script is named in the map but the delivered file never invokes it.
  put('pr/e/unused.mjs', "import { runControl } from './adapter.mjs';\nawait runControl({ id: 'x/CTL3' });\n");
  map([{ control: 'x/CTL3', delivered: A, entry: 'e/unused.mjs' }], [BUILD]);
  r = go('on');
  assert.match(r.stdout, /^UNKNOWN: /m, 'an entry the delivered file does not invoke is UNKNOWN'); assert.doesNotMatch(r.stdout, /^PASS: /m); assert.doesNotMatch(r.stdout, /unadapted:/); assert.equal(r.status, 1);

  // Negative: an exclusion that is not justified, because the excluded file invokes a script.
  map([{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }], [BUILD, { path: A, reason: 'not a control' }]);
  r = go('on');
  assert.match(r.stdout, /^UNKNOWN: /m, 'an unjustified exclusion is UNKNOWN'); assert.doesNotMatch(r.stdout, /^PASS: /m); assert.equal(r.status, 1);

  // Several mapped entries in one delivered workflow are legitimate when each is established on its own.
  put('pr/e/adapted2.mjs', "import { runControl } from './adapter.mjs';\nawait runControl({ id: 'x/CTL4' });\n");
  put('pr/.github/workflows/a.yml', 'name: a\njobs:\n  j:\n    steps:\n      - run: node e/adapted.mjs\n      - run: node e/adapted2.mjs\n      - run: node e/plain.mjs\n');
  map([{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }, { control: 'x/CTL4', delivered: A, entry: 'e/adapted2.mjs' }], [BUILD]);
  r = go('on');
  assert.match(r.stdout, /^PASS: /m, 'two entries invoked by one workflow, each established, pass'); assert.equal(r.status, 0);
  // Identity is kept per control: the unestablished one is named, the established one is not.
  map([{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }, { control: 'x/CTL2', delivered: A, entry: 'e/plain.mjs' }], [BUILD]);
  r = go('on');
  assert.match(r.stdout, /^UNKNOWN: /m); assert.match(r.stdout, /x\/CTL2/); assert.doesNotMatch(r.stdout, /x\/CTL1/, 'the verdict of one control never stands for or names another'); assert.equal(r.status, 1);
  // One entry claimed by two controls has no single identity and is UNKNOWN.
  map([{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }, { control: 'x/CTL5', delivered: A, entry: 'e/adapted.mjs' }], [BUILD]);
  r = go('on');
  assert.match(r.stdout, /^UNKNOWN: /m, 'an entry claimed by two controls is ambiguous'); assert.doesNotMatch(r.stdout, /^PASS: /m); assert.equal(r.status, 1);
}
