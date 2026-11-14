// Scratch repositories for the Cases of guard/C143. Each Case runs the Guard of this checkout against a
// repository of its own in the operating system's temporary directory.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
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
export const baseline = { '.kaal/config/guard/declared.md': decl('declared.mjs'), 'declared.mjs': say('declared') };
// A capability owns a tree; its registration is sourced in the tree and installed byte for byte under .kaal/guard/registered/.
export const owner = (cap) => ({ [`packages/${cap}/ownership.kaal.json`]: JSON.stringify({ owner: { kind: 'capability', name: cap }, paths: [`packages/${cap}/`] }), [`packages/${cap}/package.json`]: JSON.stringify({ name: cap, dependencies: {} }) });
export const dependsOn = (cap, ...deps) => ({ [`packages/${cap}/package.json`]: JSON.stringify({ name: cap, dependencies: Object.fromEntries(deps.map((d) => [d, '1.0.0'])) }) });
// A registration has one of two origins: solution (a capability's tree) or change (a Change's folder, temporary). Engineering registers nothing with Guard.
// Its source carries origin, owner and its own path; the installed copy is that file verbatim at .kaal/guard/registered/<origin>/<owner>/<name>.md.
export const SOURCES = { solution: (o, n) => `packages/${o}/guard/${n}.md`, change: (o, n) => `engineering/changes/${o}/guard/${n}.md` };
export const regText = (origin, owner, name, src) => decl(`${name}.mjs`, `origin: ${origin}\nowner: ${owner}\nsource: ${src}\ncapability: ${owner}\n`);
export const reg = (owner, name, { origin = 'solution', installed, installedAt } = {}) => {
  const src = SOURCES[origin](owner, name);
  const text = regText(origin, owner, name, src);
  return { [src]: text, [installedAt ?? `.kaal/guard/registered/${origin}/${owner}/${name}.md`]: installed ?? text, [`${name}.mjs`]: say(name) };
};
export const plan = (dir, body) => { const p = join(dir, '.git', 'plan.json'); writeFileSync(p, JSON.stringify(body)); return p; };
