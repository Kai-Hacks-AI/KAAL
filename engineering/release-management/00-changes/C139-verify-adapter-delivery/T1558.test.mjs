// Case release/T1558 tests: release/C139. The revision binding of the evidence of verify Adapter (CPO, #2628): a printed merge sha is not a binding. The evidence line carries the digest (the Git blob id) of every byte
// the runner read (the map, each delivered file, each entry), and `--bind` re-reads the same paths from Git at the recorded merge sha and compares. Equal is bound; anything else is UNKNOWN, never a PASS and never a FAIL.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RUNNER = join(repo, 'engineering/release-management/05-src/adapter/run-verify-adapter.mjs');
export const id = 'release/T1558';
export const tests = ['release/C139'];
export const title = 'the evidence of verify Adapter carries the Git blob id of each inspected file, and --bind proves from Git at the recorded merge sha that the inspected bytes are that revision\'s: a changed byte, an unreadable path, an unresolvable sha or a line without digests are UNKNOWN';
export async function run() {
  assert.ok(existsSync(RUNNER), 'the runner is absent');
  const dir = mkdtempSync(join(tmpdir(), 'adapter-bind-'));
  try {
    const sh = (cwd, ...a) => { const r = spawnSync('git', a, { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
    const put = (rel, text) => { mkdirSync(join(dir, rel, '..'), { recursive: true }); writeFileSync(join(dir, rel), text); };
    const A = '.github/workflows/a.yml';
    put('pr/e/adapted.mjs', "import { runControl } from './adapter.mjs';\nawait runControl({ id: 'x/CTL1' });\n");
    put('pr/.github/workflows/a.yml', 'name: a\njobs:\n  j:\n    steps:\n      - run: node e/adapted.mjs\n');
    put('pr/map.json', JSON.stringify({ inventory: ['.github/workflows'], rows: [{ control: 'x/CTL1', delivered: A, entry: 'e/adapted.mjs' }], notControls: [] }));
    const pr = join(dir, 'pr');
    sh(pr, 'init', '-q'); sh(pr, 'config', 'user.email', 'a@b'); sh(pr, 'config', 'user.name', 'n'); sh(pr, 'add', '-A'); sh(pr, 'commit', '-qm', 'merge result');
    const sha = sh(pr, 'rev-parse', 'HEAD');
    const env = { PATH: process.env.PATH, KAAL_FLAG: '', KAAL_PR: '7', KAAL_RUN_ID: '9', KAAL_MERGE_SHA: sha };
    const observe = spawnSync(process.execPath, [RUNNER, '--map', join(pr, 'map.json'), '--pr', pr], { encoding: 'utf8', env });
    const line = (observe.stdout.match(/^adapter-evidence (\{.*\})$/m) ?? [])[1];
    assert.ok(line, `no evidence line: ${observe.stdout}`);
    const ev = JSON.parse(line);
    assert.equal(ev.merge, sha);
    // the digests are the Git blob ids of the bytes read, one per inspected path
    for (const p of ['map.json', A, 'e/adapted.mjs']) assert.equal(ev.digests?.[p], sh(pr, 'hash-object', p), `digest of ${p} is not its blob id`);
    const bind = (evidence) => { writeFileSync(join(dir, 'evidence.json'), typeof evidence === 'string' ? evidence : JSON.stringify(evidence)); return spawnSync(process.execPath, [RUNNER, '--bind', join(dir, 'evidence.json'), '--git', pr], { encoding: 'utf8', env: { PATH: process.env.PATH } }); };
    const unknown = (r, why, what) => {
      assert.match(r.stdout, /^UNKNOWN: /m, `${what}: ${r.stdout}`);
      assert.doesNotMatch(r.stdout, /^(PASS|FAIL): /m, `${what}: neither a pass nor a fail`);
      if (why) assert.match(r.stdout, why, `${what}: the path or reason is not named`);
      assert.equal(r.status, 1, `${what}: not bound exits 1`);
    };

    // positive: the recorded bytes are the revision's
    let r = bind(ev);
    assert.match(r.stdout, /^BOUND: /m, r.stdout); assert.equal(r.status, 0);
    // negative: a byte changed after the observation (a printed sha alone would still match)
    const wrong = { ...ev, digests: { ...ev.digests, [A]: sh(pr, 'hash-object', 'map.json') } };
    unknown(bind(wrong), /a\.yml/, 'a digest that is not the revision\'s bytes');
    // negative: a path that is not in the revision
    unknown(bind({ ...ev, digests: { ...ev.digests, 'e/absent.mjs': ev.digests[A] } }), /absent\.mjs/, 'a path that does not resolve at the sha');
    // negative: a sha that does not resolve, and a line with no merge or no digests
    unknown(bind({ ...ev, merge: '0'.repeat(40) }), /merge/, 'an unresolvable merge sha');
    unknown(bind({ ...ev, merge: null }), /merge/, 'no merge sha');
    const { digests, ...bare } = ev; unknown(bind(bare), /digests/, 'no digests');
    unknown(bind({ ...ev, digests: {} }), /digests/, 'empty digests');
    unknown(bind('not json'), /malformed|evidence/, 'a line that is not evidence');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
