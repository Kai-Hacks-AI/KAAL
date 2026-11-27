// Case release/T1573 tests: release/C154. The demonstration map gives verify Adapter a real PASS for the one control that integrates the adapter, bound to its revision by the bytes, and
// the real map keeps saying UNKNOWN. Structure only: nothing here observes that the entry ran.
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = 'engineering/release-management';
const RUNNER = join(repo, RM, '05-src/adapter/run-verify-adapter.mjs');
const DEMO = join(repo, RM, '05-src/adapter/delivery-map.demo.json');
const REAL = join(repo, RM, '05-src/adapter/delivery-map.json');
const ENTRY = `${RM}/05-src/workflow-names/judge-workflow-names.mjs`;
const DELIVERED = '.github/workflows/verify-workflow-names.yml';
export const id = 'release/T1573';
export const tests = ['release/C154'];
export const title = 'the demonstration map gives PASS and BOUND for the one adapted entry of CTL36 and UNKNOWN when the evidence is moved to a revision whose bytes differ, and the real map still says UNKNOWN naming a control not migrated';
export async function run() {
  assert.ok(existsSync(DEMO), 'the demonstration map is absent');
  const dir = mkdtempSync(join(tmpdir(), 'adapter-demo-'));
  try {
    const sh = (...a) => { const r = spawnSync('git', a, { cwd: dir, encoding: 'utf8' }); assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
    for (const f of [DELIVERED, ENTRY]) { mkdirSync(join(dir, dirname(f)), { recursive: true }); copyFileSync(join(repo, f), join(dir, f)); }
    sh('init', '-q'); sh('config', 'user.email', 'a@b'); sh('config', 'user.name', 'n'); sh('add', '-A'); sh('commit', '-qm', 'merge result');
    const sha = sh('rev-parse', 'HEAD');
    const env = { PATH: process.env.PATH, KAAL_FLAG: 'on', KAAL_PR: '7', KAAL_RUN_ID: '9', KAAL_MERGE_SHA: sha };
    const go = (map, pr) => spawnSync(process.execPath, [RUNNER, '--map', map, '--pr', pr], { encoding: 'utf8', env });

    let r = go(DEMO, dir);
    assert.match(r.stdout, /^PASS: /m, r.stdout); assert.equal(r.status, 0);
    const line = (r.stdout.match(/^adapter-evidence (\{.*\})$/m) ?? [])[1];
    assert.ok(line, 'no evidence line'); assert.equal(JSON.parse(line).verdict, 'PASS');
    writeFileSync(join(dir, '..', `${dir.split('/').pop()}-evidence.json`), line);
    const evidence = join(dir, '..', `${dir.split('/').pop()}-evidence.json`);
    const bind = spawnSync(process.execPath, [RUNNER, '--bind', evidence, '--git', dir], { encoding: 'utf8' });
    assert.match(bind.stdout, /^BOUND: /m, bind.stdout); assert.equal(bind.status, 0);
    // the entry changes in a later revision: the old evidence still names its own sha and is bound there, and moved to the later sha its bytes are not that revision's
    writeFileSync(join(dir, ENTRY), `${readFileSync(join(dir, ENTRY), 'utf8')}\n// changed in a later revision\n`);
    sh('add', '-A'); sh('commit', '-qm', 'a later revision');
    const later = spawnSync(process.execPath, [RUNNER, '--bind', evidence, '--git', dir], { encoding: 'utf8' });
    assert.match(later.stdout, /^BOUND: /m, 'the old evidence still names its own sha');
    const wrong = JSON.parse(line); wrong.merge = sh('rev-parse', 'HEAD');
    writeFileSync(evidence, JSON.stringify(wrong));
    const moved = spawnSync(process.execPath, [RUNNER, '--bind', evidence, '--git', dir], { encoding: 'utf8' });
    assert.match(moved.stdout, /^UNKNOWN: /m, `an evidence line moved to another revision is not bound: ${moved.stdout}`); assert.equal(moved.status, 1);
    rmSync(evidence, { force: true });

    // the real map on the repository is not weakened: it still says UNKNOWN, naming a control this Change does not migrate
    r = go(REAL, repo);
    assert.match(r.stdout, /^UNKNOWN: /m, r.stdout); assert.match(r.stdout, /release\/CTL1\b/); assert.doesNotMatch(r.stdout, /^PASS: /m);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
