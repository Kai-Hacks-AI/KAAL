// Fixtures of C124: a folder with workflows, and the command run against it.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const command = fileURLToPath(new URL('../../05-src/workflow-names/judge-workflow-names.mjs', import.meta.url));
export const judgeMode = fileURLToPath(new URL('../../../../packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs', import.meta.url));
export const baselineFile = fileURLToPath(new URL('../../04-controls/CTL36-verify-workflow-names/baseline.json', import.meta.url));

// files: { 'ci.yml': 'name: x\non: push\n' }
export function folder(files) {
  const root = mkdtempSync(join(tmpdir(), 'c124-'));
  mkdirSync(join(root, '.github', 'workflows'), { recursive: true });
  for (const [f, text] of Object.entries(files)) writeFileSync(join(root, '.github', 'workflows', f), text);
  return root;
}
export const wf = (name) => (name === undefined ? 'on: push\n' : `name: ${name}\non: push\n`);
export const emptyFolder = () => mkdtempSync(join(tmpdir(), 'c124-'));

export function emit(head) {
  const out = join(mkdtempSync(join(tmpdir(), 'c124-out-')), 'findings.json');
  const r = spawnSync(process.execPath, [command, '--head', head, '--out', out], { encoding: 'utf8' });
  return { code: r.status, stderr: r.stderr, out };
}
// The verdict step of the job: judge-mode in ratchet mode.
export function verdict({ findings, baseline, previous }) {
  const dir = mkdtempSync(join(tmpdir(), 'c124-v-'));
  const w = (n, v) => { const p = join(dir, n); if (v !== undefined) writeFileSync(p, JSON.stringify(v)); return p; };
  const args = [judgeMode, '--mode', 'ratchet', '--findings', w('f.json', findings), '--baseline', w('b.json', baseline)];
  if (previous !== undefined) args.push('--previous', w('p.json', previous));
  const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return { code: r.status, ...JSON.parse(r.stdout) };
}
