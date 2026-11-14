// Scratch repositories for the Cases of guard/C143. Each Case runs the Guard of this checkout against a
// repository of its own in the operating system's temporary directory.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const bin = join(repo, 'packages/kaal-guard/bin/kaal-guard.mjs');
const git = (cwd, ...a) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' });

// A check that prints its own name, so a run shows which checks ran.
export const say = (name) => `console.log('RAN ${name}');\n`;
export const decl = (script, extra = '') => `---\ntype: Guard/Check\ncommand: node ${script}\nruns: [hook]\nfacts: [head, base, changed]\n${extra}---\nA test check.\n`;

export function scratch(files) {
  const dir = mkdtempSync(join(tmpdir(), 'c143-'));
  git(dir, 'init', '-q', '-b', 'main');
  put(dir, files);
  git(dir, 'add', '-A'); git(dir, 'commit', '-q', '-m', 'base');
  return dir;
}
export function put(dir, files) {
  for (const [path, text] of Object.entries(files)) {
    if (text === null) { rmSync(join(dir, path), { force: true }); continue; }
    mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text);
  }
}
export function commit(dir, files) { put(dir, files); git(dir, 'add', '-A'); git(dir, 'commit', '-q', '-m', 'head'); }
export function rev(dir, ref) { return git(dir, 'rev-parse', ref).stdout.trim(); }
// Runs the hook exactly as the installed pre-push hook does: it names no check and no registration.
export function hook(dir, base, extra = []) {
  const head = rev(dir, 'HEAD');
  const changed = join(dir, '.git', 'changed-paths');
  writeFileSync(changed, git(dir, 'diff', '--name-only', '-z', `${base}...${head}`).stdout);
  const r = spawnSync(process.execPath, [bin, 'run', '--hook', '--head', head, '--base', base, '--base-ref', 'main', '--changed', changed, ...extra], { cwd: dir, encoding: 'utf8', input: '' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}
export const cleanup = (dir) => rmSync(dir, { recursive: true, force: true });
export const baseline = { '.kaal/config/guard/delivery.md': decl('delivery.mjs'), 'delivery.mjs': say('delivery') };
export const reg = (capability, name, extra = '') => ({
  [`.kaal/guard/registered/${capability}/${name}.md`]: decl(`${name}.mjs`, `capability: ${capability}\n${extra}`),
  [`${name}.mjs`]: say(name),
});
