// Case release/T1557 tests: release/C139. The evidence-completeness boundaries of the runner of verify Adapter (CPO, #2628): an inventory that cannot be inspected is not an empty one,
// and a delivery map that is empty, malformed or incomplete never gives a PASS. Everything unestablished is UNKNOWN: never a FAIL, never a PASS, never `adapted: false`.
import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RUNNER = join(repo, 'engineering/release-management/05-src/adapter/run-verify-adapter.mjs');
export const id = 'release/T1557';
export const tests = ['release/C139'];
export const title = 'the runner of verify Adapter says UNKNOWN naming the location when a declared delivered directory is missing or unreadable, and when the delivery map is empty, malformed or incomplete; a verified empty directory and a complete map are the only way to a verdict';
export async function run() {
  assert.ok(existsSync(RUNNER), 'the runner is absent');
  const dir = mkdtempSync(join(tmpdir(), 'adapter-bound-'));
  try {
    const put = (rel, text) => { mkdirSync(join(dir, rel, '..'), { recursive: true }); writeFileSync(join(dir, rel), text); };
    const A = '.github/workflows/a.yml';
    const row = { control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' };
    const good = { inventory: ['.github/workflows'], rows: [row], notControls: [] };
    const go = (map, flag = 'on') => {
      put('map.json', typeof map === 'string' ? map : JSON.stringify(map));
      return spawnSync(process.execPath, [RUNNER, '--map', join(dir, 'map.json'), '--pr', join(dir, 'pr')], { encoding: 'utf8', env: { PATH: process.env.PATH, KAAL_FLAG: flag, KAAL_PR: '7', KAAL_RUN_ID: '9' } });
    };
    const unknown = (r, why, what) => {
      assert.match(r.stdout, /^UNKNOWN: /m, `${what}: ${r.stdout}`);
      assert.doesNotMatch(r.stdout, /^(PASS|FAIL): /m, `${what}: neither a pass nor a fail`);
      assert.doesNotMatch(r.stdout, /unadapted:/, `${what}: never an unadapted finding`);
      if (why) assert.match(r.stdout, why, `${what}: the location or reason is not named`);
      assert.equal(r.status, 1, `${what}: the live flag fails`);
      assert.match(r.stdout, /^adapter-evidence \{.*"verdict":"UNKNOWN"/m, `${what}: no evidence line`);
    };

    put('pr/e/adapted.mjs', "import { runControl } from './adapter.mjs';\nawait runControl({ id: 'x/CTL1' });\n");
    put('pr/.github/workflows/a.yml', 'name: a\njobs:\n  j:\n    steps:\n      - run: node e/adapted.mjs\n');

    // positive: a complete map and a declared directory that exists give the verdict
    let r = go(good);
    assert.match(r.stdout, /^PASS: /m, r.stdout); assert.equal(r.status, 0);
    // positive: a declared directory that exists and is verifiably empty is an empty inventory, and gives no finding of its own
    mkdirSync(join(dir, 'pr/.githooks'), { recursive: true });
    r = go({ ...good, inventory: ['.github/workflows', '.githooks'] });
    assert.match(r.stdout, /^PASS: /m, 'a verified empty directory is not UNKNOWN'); assert.equal(r.status, 0);

    // negative: a declared directory that is missing is not an empty inventory
    r = go({ ...good, inventory: ['.github/workflows', '.githooks-absent'] });
    unknown(r, /\.githooks-absent/, 'a missing declared directory');
    // negative: a declared path that is not a directory, and one that cannot be read
    put('pr/not-a-dir', 'x');
    unknown(go({ ...good, inventory: ['.github/workflows', 'not-a-dir'] }), /not-a-dir/, 'a declared path that is a file');
    if (process.getuid && process.getuid() !== 0) {
      mkdirSync(join(dir, 'pr/sealed'), { recursive: true }); chmodSync(join(dir, 'pr/sealed'), 0);
      try { unknown(go({ ...good, inventory: ['.github/workflows', 'sealed'] }), /sealed/, 'an unreadable declared directory'); } finally { chmodSync(join(dir, 'pr/sealed'), 0o755); }
    }
    symlinkSync('/nonexistent-target', join(dir, 'pr/dangling'));
    unknown(go({ ...good, inventory: ['.github/workflows', 'dangling'] }), /dangling/, 'a declared directory that is a dangling link');
    // negative: the pull request folder itself cannot be read
    r = spawnSync(process.execPath, [RUNNER, '--map', join(dir, 'map.json'), '--pr', join(dir, 'absent-pr')], { encoding: 'utf8', env: { PATH: process.env.PATH, KAAL_FLAG: 'on', KAAL_PR: '7', KAAL_RUN_ID: '9' } });
    unknown(r, /pull request folder/, 'a missing pull request folder');
    // the verdict is the same detective one without the live flag: written, exit 0
    assert.equal(go({ ...good, inventory: ['.github/workflows', '.githooks-absent'] }, '').status, 0, 'only exactly on fails the job');

    // negative: a delivery map that is absent, empty, malformed or incomplete never gives a PASS
    unknown(spawnSync(process.execPath, [RUNNER, '--map', join(dir, 'no-such-map.json'), '--pr', join(dir, 'pr')], { encoding: 'utf8', env: { PATH: process.env.PATH, KAAL_FLAG: 'on' } }), /delivery map/, 'an absent map');
    unknown(go('{ not json'), /delivery map/, 'a map that is not JSON');
    unknown(go('[]'), /delivery map/, 'a map that is not an object');
    unknown(go('{}'), /map/, 'an empty object');
    unknown(go({ inventory: ['.github/workflows'], rows: [], notControls: [] }), /rows/, 'a map without rows');
    const without = (k) => { const { [k]: _, ...rest } = good; return rest; };
    unknown(go(without('rows')), /rows/, 'a map that declares no rows');
    unknown(go(without('inventory')), /inventory/, 'a map that declares no inventory');
    unknown(go({ ...good, inventory: [] }), /inventory/, 'a map with an empty inventory declaration');
    unknown(go({ ...good, inventory: ['.github/workflows', 7] }), /inventory/, 'an inventory entry that is not a path');
    unknown(go(without('notControls')), /notControls/, 'a map that declares no exclusions list');
    unknown(go({ ...good, notControls: 'none' }), /notControls/, 'a map whose exclusions are not a list');
    for (const [what, bad] of [['no control', { delivered: A, entry: 'e/adapted.mjs' }], ['no delivered file', { control: 'x/CTL1', entry: 'e/adapted.mjs' }], ['no entry', { control: 'x/CTL1', delivered: A }], ['an empty entry', { control: 'x/CTL1', delivered: A, entry: '' }], ['a row that is not an object', 'x/CTL1']]) {
      unknown(go({ ...good, rows: [row, bad] }), /malformed/, `a row with ${what}`);
    }
    // an exclusion without a path, or without a reason, is not taken
    unknown(go({ ...good, notControls: [{ reason: 'r' }] }), /notControls|unjustified|malformed/, 'an exclusion without a path');
    // the established control is not named when the map is the problem
    assert.doesNotMatch(go(without('inventory')).stdout, /x\/CTL1/, 'the problem is the map, not a control');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
