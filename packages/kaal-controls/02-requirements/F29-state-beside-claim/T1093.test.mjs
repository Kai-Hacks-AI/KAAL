// Case controls/T1093 tests: controls/F29
import assert from 'node:assert/strict';
import { existsSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'approve Sync', description: 'A SYNC is approved when it is pure.', type: 'preventive', status: 'running', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const MIN = '[fixture:3, merge:2, provoked:1:fail]';
const CASE = '// Case demo/T1 tests: demo/CTL1\n';
const rec = (x, run, outcome = 'GREEN', base) => ({ case: 'demo/T1', x, run, outcome, ...(base ? { base } : {}) });
const some = () => [rec('fixture', 1), rec('fixture', 2), rec('merge', 'a')];
const all = () => [rec('fixture', 1), rec('fixture', 2), rec('fixture', 3), rec('merge', 'a'), rec('merge', 'b'), rec('provoked', 'x', 'GREEN', { run: 'x0', outcome: 'RED' })];
const ctl = async (o = {}) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item(o) }, { path: 'x/T1.test.mjs', text: CASE }]).controls[0]; };

export const id = 'controls/T1093';
export const tests = ['controls/F29'];
export const title = 'the command shows a line for every control that declares a minimum whatever its claim, skips those without one, and fails only a tested claim that is not shown';
export async function run() {
  const e = join(S, 'evidence.mjs');
  assert.ok(existsSync(e), 'the evidence script is absent');
  const dir = mkdtempSync(join(tmpdir(), 'c16-'));
  const put = (n, o) => { mkdirSync(join(dir, n), { recursive: true }); writeFileSync(join(dir, n, `CTL${n}.md`), item({ id: `demo/CTL${n}`, ...o })); writeFileSync(join(dir, n, 'T1.test.mjs'), '// Case demo/T' + n + ' tests: demo/CTL' + n + '\n'); };
  put('1', { status: 'running', evidence: MIN });
  put('2', { status: 'designed', evidence: MIN });
  put('3', { status: 'running' });
  const run = (...a) => spawnSync(process.execPath, [e, dir, ...a], { encoding: 'utf8' });
  const r = run();
  assert.equal(r.status, 0, 'a running claim with progress failed the command');
  const lines = r.stdout.trim().split('\n');
  assert.equal(lines.length, 2, 'the command did not show one line per control with a minimum');
  assert.ok(lines.some((l) => l.includes('demo/CTL1') && l.includes('claimed running')), 'a running claim was not shown');
  assert.ok(lines.some((l) => l.includes('demo/CTL2') && l.includes('claimed designed')), 'a designed claim was not shown');
  assert.ok(!r.stdout.includes('demo/CTL3'), 'a control without a minimum was shown');
  put('4', { status: 'tested', evidence: MIN });
  assert.equal(run().status, 1, 'a tested claim that is not shown passed');
  const j = run('--json');
  assert.ok(Array.isArray(JSON.parse(j.stdout)), 'the JSON output is not an array');
}
