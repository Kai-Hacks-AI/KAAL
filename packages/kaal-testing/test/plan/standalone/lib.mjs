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

/** Anything that is the machine, the registry or npm itself failing, never a verdict on the package. */
const INFRASTRUCTURE = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ESOCKETTIMEDOUT|ENETUNREACH|EHOSTUNREACH|EPROXY|ERR_SOCKET|EPIPE|ENOSPC|EACCES|EPERM|EBUSY|EMFILE|ENOMEM|EAUTH|E401|E403|E429|E5\d\d|\b(?:500|502|503|504)\b|network|rate limit|socket hang up|certificate|CERT_|registry/i;
const cleanEnv = () => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  for (const k of Object.keys(env)) if (/^npm_/i.test(k) && !/^npm_config_(registry|cache|proxy|https_proxy|http_proxy|strict_ssl|cafile)$/i.test(k)) delete env[k];
  // A dead registry must end the Case quickly, as UNKNOWN: few retries, short waits.
  Object.assign(env, { npm_config_fetch_retries: '1', npm_config_fetch_retry_mintimeout: '500', npm_config_fetch_retry_maxtimeout: '2000', npm_config_fetch_timeout: '20000' });
  return env;
};
export function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', env: cleanEnv(), timeout: 240000, ...opts });
}
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

/**
 * Ends a Case on a failed npm step. The machine, the registry or npm failing (a command that did not start or was
 * stopped, a timeout, a network, disk, permission or registry error) throws a plain Error, which a runner reports as
 * UNKNOWN. Only a failure npm attributes to the package itself is an assertion, which is RED.
 */
export function failed(step, r) {
  const text = `${r.stderr ?? ''}${r.stdout ?? ''}`;
  if (r.error || r.status === null || r.signal || INFRASTRUCTURE.test(text)) throw new Error(`${step} could not be judged, the infrastructure failed: ${r.error?.message ?? r.signal ?? text.slice(0, 300)}`);
  assert.fail(`${step}: ${text.slice(0, 600)}`);
}

/** Whether npm can resolve each declared runtime dependency of the package: an unreachable registry is UNKNOWN, a version that does not exist is RED. */
function resolvable(manifestPath) {
  const { dependencies = {} } = readJson(manifestPath);
  for (const [name, range] of Object.entries(dependencies)) {
    const r = sh('npm', ['view', `${name}@${range}`, 'version', '--json'], { timeout: 60000 });
    if (r.status === 0 && r.stdout.trim()) continue;
    if (/E404|ETARGET|No match found|code E404/i.test(`${r.stderr}${r.stdout}`) && !r.error && r.status !== null && !r.signal) assert.fail(`the package declares ${name}@${range}, which the registry does not have`);
    failed(`resolving ${name}@${range}`, r);
  }
}

let cached;
let stopped;
/**
 * Packs the package and installs the tarball into an empty project outside any repository, once per process.
 * Returns { project, root } where root is the installed package. Failures of the infrastructure are errors (UNKNOWN), never RED.
 */
export function install() {
  if (cached) return cached;
  if (stopped) throw stopped;
  try {
    return (cached = build());
  } catch (e) {
    stopped = e;
    throw e;
  }
}
function build() {
  const work = mkdtempSync(join(tmpdir(), 'kaal-testing-standalone-'));
  const pack = sh('npm', ['pack', '--ignore-scripts', '--pack-destination', work, '--json'], { cwd: PACKAGE });
  if (pack.status !== 0) failed('the package does not pack', pack);
  const tarball = join(work, JSON.parse(pack.stdout)[0].filename);
  resolvable(join(PACKAGE, 'package.json'));
  const project = join(work, 'consumer');
  mkdirSync(project);
  writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'consumer', version: '1.0.0', private: true, type: 'module' }));
  const r = sh('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts', tarball], { cwd: project });
  if (r.status !== 0) failed('the packed package does not install into an empty project', r);
  return { project, root: join(project, 'node_modules', NAME) };
}

/** The names of every package the install put anywhere in the tree, nested or not, read from the lockfile npm wrote. */
export function arrived(project) {
  const lock = readJson(join(project, 'package-lock.json'));
  const names = new Set();
  for (const key of Object.keys(lock.packages ?? {})) {
    const i = key.lastIndexOf('node_modules/');
    if (i >= 0) names.add(key.slice(i + 'node_modules/'.length));
  }
  return [...names].sort();
}
/** The packages of the KAAL family among `names` that are not allowed. The allowlist is fixed here, never derived from what arrived. */
export function unintended(names) {
  return names.filter((n) => /^kaal-|^@kaihacksai\//.test(n) && ![NAME, ...FAMILY].includes(n));
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
