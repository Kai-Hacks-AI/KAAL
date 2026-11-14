// Case skills/T266 tests: skills/N1. kaal-skills is inert: no runtime, no consumer, no wiring.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PKG, ROOT } from './lib.mjs';
export const id = 'skills/T266';
export const tests = ['skills/N1'];
export const title = 'kaal-skills ships no export, command or dependency, no other package depends on it or imports it, and nothing in .github, .githooks or the Guard configuration names it';
const walk = (dir, out = []) => { for (const n of readdirSync(dir)) { if (n === 'node_modules' || n === '.git') continue; const p = join(dir, n); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };
export function run() {
  const manifest = join(PKG, 'package.json');
  assert.ok(existsSync(manifest), 'missing: packages/kaal-skills/package.json');
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  assert.equal(pkg.private, true, 'kaal-skills is private: nothing of it is published or consumed');
  for (const k of ['exports', 'main', 'bin', 'files', 'dependencies', 'peerDependencies', 'optionalDependencies']) assert.ok(!(k in pkg), `kaal-skills declares no ${k}`);
  const users = [];
  for (const dir of readdirSync(join(ROOT, 'packages'))) {
    if (dir === 'kaal-skills') continue;
    const m = join(ROOT, 'packages', dir, 'package.json');
    if (existsSync(m)) { const j = JSON.parse(readFileSync(m, 'utf8')); for (const k of ['dependencies', 'peerDependencies', 'optionalDependencies']) if (j[k] && 'kaal-skills' in j[k]) users.push(`${dir}: ${k}`); }
    for (const f of walk(join(ROOT, 'packages', dir)).filter((p) => /\.(mjs|js|ts|cjs)$/.test(p))) if (/from\s+['"]kaal-skills|require\(['"]kaal-skills/.test(readFileSync(f, 'utf8'))) users.push(relative(ROOT, f));
  }
  assert.deepEqual(users, [], 'no package depends on or imports kaal-skills');
  const wired = ['.github', '.githooks', '.kaal/config'].filter((d) => existsSync(join(ROOT, d))).flatMap((d) => walk(join(ROOT, d))).filter((f) => /kaal-skills/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(wired.map((f) => relative(ROOT, f)), [], 'no hook, workflow or Guard check names kaal-skills');
}
