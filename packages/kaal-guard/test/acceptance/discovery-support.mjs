// Scratch repositories for the discovery Cases (guard/F43 to guard/F45). Each Case runs this package's Guard
// against a repository of its own in the operating system's temporary directory.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** The package under test and its command. */
export const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const bin = join(PACKAGE, 'bin', 'kaal-guard.mjs');
/** Where a repository keeps its declared checks and its always-run kaal-guard.json; joined, never written out (guard/T30). */
const ENGINE = ['.kaal', ''].join('/');
export const ALWAYS = `${ENGINE}kaal-guard.json`;

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
export function hook(dir, base, extra = [], { noChanged = false } = {}) {
  const head = rev(dir, 'HEAD');
  const changed = join(dir, '.git', 'changed-paths');
  writeFileSync(changed, git(dir, 'diff', '--name-only', '-z', `${base}...${head}`).stdout);
  const r = spawnSync(process.execPath, [bin, 'run', '--hook', '--head', head, '--base', base, '--base-ref', 'main', ...(noChanged ? [] : ['--changed', changed]), ...extra], { cwd: dir, encoding: 'utf8', input: '' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}
export const cleanup = (dir) => rmSync(dir, { recursive: true, force: true });
export const baseline = { [`${ENGINE}config/guard/declared.md`]: decl('declared.mjs'), 'declared.mjs': say('declared') };
/** An engineering area's folder, joined so no file of the package names an Engineering path (guard/T30). */
export const AREA = ['engineering', 'area'].join('/');
// A kaal-guard.json lists checks (id, run, optional when). Each check runs a script that prints its own name.
export const kg = (...checks) => JSON.stringify({ checks: checks.map((c) => (typeof c === 'string' ? { id: c, run: `node checks/${c}.mjs` } : { run: `node checks/${c.id}.mjs`, ...c })) }, null, 2);
// Scripts for the named checks, at checks/<name>.mjs in the repository root.
export const scripts = (...names) => Object.fromEntries(names.map((n) => [`checks/${n}.mjs`, say(n)]));
export const plan = (dir, body) => { const p = join(dir, '.git', 'plan.json'); writeFileSync(p, JSON.stringify(body)); return p; };
// Which of the named checks ran.
export const ran = (r, names) => names.filter((n) => r.out.includes(`RAN ${n}`));
