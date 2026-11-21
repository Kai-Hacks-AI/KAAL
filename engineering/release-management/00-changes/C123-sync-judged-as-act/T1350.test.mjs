// Case release/T1350 tests: release/D18
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const PHASE = join(repo, 'engineering/release-management/05-src/phase');
export const id = 'release/T1350';
export const tests = ['release/D18'];
export const title = 'a SYNC (a merge of main into a collector) is judged "not an ACT" by limit Act: what arrives from main is not the pull request\'s own change';
const RR = 'engineering/release-management';
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 't1350-'));
  const git = (...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const put = (p, t) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), t); };
  try {
    git('init', '-q', '-b', 'main');
    put(`${RR}/02-learnings/retros/RT1.md`, 'one\n');
    git('add', '-A'); git('commit', '-q', '-m', 'A');
    git('checkout', '-q', '-b', 'collector');
    put(`${RR}/00-changes/C1/C1.md`, 'own\n');                 // the collector's own work, not an ACT
    git('add', '-A'); git('commit', '-q', '-m', 'B');
    git('checkout', '-q', 'main');
    put(`${RR}/02-learnings/retros/RT2.md`, 'from main\n');      // arrives from main: a path of the route act
    put(`${RR}/00-changes/C2/C2.md`, 'from main\n');             // arrives from main: outside the route act
    put('.github/workflows/x.yml', 'from main\n');
    git('add', '-A'); git('commit', '-q', '-m', 'M');
    git('checkout', '-q', 'collector');
    git('merge', '-q', '--no-ff', '-m', 'SYNC', 'main');          // the SYNC: a pure merge of main into the collector
    const sync = git('rev-parse', 'HEAD').trim();
    git('checkout', '-q', '-b', 'merge-result', 'collector~1');   // what the check sees: the pull request merged into its base
    git('merge', '-q', '--no-ff', '-m', 'merge result', sync);
    const { changedPaths } = await import(pathToFileURL(join(PHASE, 'run-controls-act.mjs')).href);
    const { judgeLimitAct } = await import(pathToFileURL(join(PHASE, 'judge-limit-act.mjs')).href);
    const map = JSON.parse(readFileSync(join(PHASE, 'write-map.json'), 'utf8'));
    const changed = changedPaths(dir);
    const a = judgeLimitAct({ changed, map, roots: [RR] });
    assert.equal(a.verdict, 'PASS', `limit Act answers ${a.verdict} for a SYNC: ${a.message}`);
    assert.equal(a.applies, false, 'a SYNC is not an ACT, so limit Act does not apply');
    assert.deepEqual(changed, [], `a pure SYNC brings no change of its own, but the paths read are: ${changed.join(', ')}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
