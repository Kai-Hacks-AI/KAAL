// Helpers for the testing/C65 planned Cases. They pack the package, install it into an empty project and observe it from outside.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = dirname(fileURLToPath(import.meta.url));
/** The package under test. Validation only: KAAL_TESTING_PACKAGE points at a throwaway reference outside the repository. */
export const PACKAGE = process.env.KAAL_TESTING_PACKAGE ? resolve(process.env.KAAL_TESTING_PACKAGE) : resolve(HERE, '../../..');
export const NAME = 'kaal-testing';
/** The only packages of the KAAL family a consumer may end up with besides the package itself (testing/F147). */
export const FAMILY = ['@kaihacksai/kaal-hosting', '@kaihacksai/kaal-foundation'];
/** The runtime dependencies Testing may declare (testing/F147). */
export const DEPENDENCIES = [...FAMILY, 'c8'];

const NETWORK = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|network/i;
const cleanEnv = () => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  for (const k of Object.keys(env)) if (/^npm_/i.test(k)) delete env[k];
  return env;
};
export function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', env: cleanEnv(), timeout: 240000, ...opts });
}
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

let cached;
/**
 * Packs the package and installs the tarball into an empty project outside any repository, once per process.
 * Returns { project, root } where root is the installed package. A network failure is an error (UNKNOWN), never RED.
 */
export function install() {
  if (cached) return cached;
  const work = mkdtempSync(join(tmpdir(), 'kaal-testing-standalone-'));
  const pack = sh('npm', ['pack', '--ignore-scripts', '--pack-destination', work, '--json'], { cwd: PACKAGE });
  assert.equal(pack.status, 0, `the package does not pack: ${pack.stderr}`);
  const tarball = join(work, JSON.parse(pack.stdout)[0].filename);
  const project = join(work, 'consumer');
  mkdirSync(project);
  writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'consumer', version: '1.0.0', private: true, type: 'module' }));
  const r = sh('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts', tarball], { cwd: project });
  if (r.status !== 0 && NETWORK.test(r.stderr)) throw new Error(`install could not reach the registry: ${r.stderr.slice(0, 300)}`);
  assert.equal(r.status, 0, `the packed package does not install into an empty project: ${r.stderr.slice(0, 600)}`);
  cached = { project, root: join(project, 'node_modules', NAME) };
  return cached;
}

/** Every file of the installed package, relative to its root, skipping nested node_modules. */
export function files(root) {
  const out = [];
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      if (n === 'node_modules') continue;
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(root, p).replaceAll('\\', '/'));
    }
  };
  walk(root);
  return out.sort();
}
export const text = (root, f) => readFileSync(join(root, f), 'utf8');
export const manifest = (root) => readJson(join(root, 'package.json'));

/** Top-level packages of the installed tree, with scope, sorted. */
export function installed(project) {
  const nm = join(project, 'node_modules');
  const out = [];
  for (const n of readdirSync(nm)) {
    if (n.startsWith('.')) continue;
    if (n.startsWith('@')) for (const m of readdirSync(join(nm, n))) out.push(`${n}/${m}`);
    else out.push(n);
  }
  return out.sort();
}
export { existsSync, join, readdirSync, readFileSync, writeFileSync };
