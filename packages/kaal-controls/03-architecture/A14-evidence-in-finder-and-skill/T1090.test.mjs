// Case controls/T1090 tests: controls/A14
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
const rec = (x, run, outcome = 'GREEN', c = 'demo/T1', base) => ({ case: c, x, run, outcome, ...(base ? { base } : {}) });
const enough = () => [rec('fixture', 1), rec('fixture', 2), rec('fixture', 3), rec('merge', 'a'), rec('merge', 'b'), rec('provoked', 'x', 'GREEN', 'demo/T1', { run: 'x0', outcome: 'RED' })];

export const id = 'controls/T1090';
export const tests = ['controls/A14'];
export const title = 'the Skill says that evidence is the Cases of the control run against an X and how Tested is shown, stays within its cap, and the scripts know no repository';
export async function run() {
  const sk = join(pkg, 'skills/kaal-controls');
  assert.ok(readFileSync(join(sk, 'SKILL.md'), 'utf8').split(/\s+/).filter(Boolean).length <= 600, 'SKILL.md is over its cap');
  const d = readFileSync(join(sk, 'references/declaring-controls.md'), 'utf8');
  for (const w of ['evidence', ':fail', 'Cases', 'X', 'runs']) assert.ok(d.includes(w), `declaring-controls.md does not say ${w}`);
  const j = readFileSync(join(sk, 'references/judging-status.md'), 'utf8');
  for (const w of ['GREEN', 'UNKNOWN', 'minimum', 'evidence.mjs', '--records', 'x']) assert.ok(j.includes(w), `judging-status.md does not say ${w}`);
  assert.ok(existsSync(join(S, 'evidence.mjs')), 'the evidence script is absent');
  for (const f of ['evidence.mjs', 'check-controls.mjs', 'find-controls.mjs']) assert.ok(!/Kai-Hacks|engineering\//.test(readFileSync(join(S, f), 'utf8')), `${f} knows the repository`);
}
