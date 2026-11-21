// Case controls/T1089 tests: controls/F28
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const S = join(pkg, 'skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'approve Sync', description: 'A SYNC is approved when it is pure.', type: 'preventive', status: 'running', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const MIN = '[fixture:3, merge:2, provoked:1:fail]';
const CASE = '// Case demo/T1 tests: demo/CTL1\n';
const ctl = (findControls, o = {}) => findControls([{ path: 'x/CTL1.md', text: item({ status: 'tested', ...o }) }, { path: 'x/T1.test.mjs', text: CASE }]).controls[0];
const rec = (x, run, outcome = 'GREEN', c = 'demo/T1', base) => ({ case: c, by: 'runner', x, run, outcome, ...(base ? { base } : {}) });
const enough = () => [rec('fixture', 1), rec('fixture', 2), rec('fixture', 3), rec('merge', 'a'), rec('merge', 'b'), rec('provoked', 'x', 'GREEN', 'demo/T1', { run: 'x0', outcome: 'RED' })];

export const id = 'controls/T1089';
export const tests = ['controls/F28'];
export const title = 'given records, check-controls fails a tested claim whose evidence is not shown and passes it when the minimum is recorded; without records it reads declarations only; running needs no evidence';
export async function run() {
  const cc = join(S, 'check-controls.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'c15-'));
  const run = (...a) => spawnSync(process.execPath, [cc, dir, ...a], { encoding: 'utf8' });
  const put = (text) => { mkdirSync(join(dir, 'a'), { recursive: true }); writeFileSync(join(dir, 'a', 'CTL1.md'), text); writeFileSync(join(dir, 'a', 'T1.test.mjs'), CASE); };
  put(item({ status: 'running' }));
  assert.equal(run().status, 0, 'a running claim needed evidence');
  const rf = join(dir, 'records.json');
  writeFileSync(rf, '[]');
  assert.equal(run('--records', rf).status, 0, 'a running claim failed given records');
  put(item({ status: 'tested' }));
  assert.equal(run().status, 0, 'without records a tested claim was judged');
  const r = run('--records', rf);
  assert.equal(r.status, 1, 'a tested claim with no minimum passed given records');
  assert.match(r.stderr, /demo\/CTL1/);
  assert.match(r.stderr, /tested is not shown/);
  put(item({ status: 'tested', evidence: MIN }));
  assert.equal(run('--records', rf).status, 1, 'a tested claim with no recorded run passed');
  writeFileSync(rf, JSON.stringify(enough().slice(1)));
  assert.equal(run('--records', rf).status, 1, 'a short record set passed');
  writeFileSync(rf, JSON.stringify(enough()));
  assert.equal(run('--records', rf).status, 0, 'a met minimum did not pass');
  const rd = join(dir, 'records');
  mkdirSync(rd);
  enough().forEach((x, i) => writeFileSync(join(rd, `r${i}.json`), JSON.stringify(x)));
  assert.equal(run('--records', rd).status, 0, 'a directory of records did not pass');
}
