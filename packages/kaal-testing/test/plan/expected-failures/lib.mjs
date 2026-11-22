// Helpers for the testing/C67 planned Cases. They pack the package, install it into an empty project and observe the installed copy.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export { assert, existsSync, join, readFileSync, readdirSync, writeFileSync };
const HERE = dirname(fileURLToPath(import.meta.url));
/** The package under test. Validation only: KAAL_TESTING_PACKAGE points at a throwaway reference outside the repository. */
export const PACKAGE = process.env.KAAL_TESTING_PACKAGE ? resolve(process.env.KAAL_TESTING_PACKAGE) : resolve(HERE, '../../..');
const REGISTRY_DOWN = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENETUNREACH|EHOSTUNREACH|EPERM|EACCES|ENOSPC|network|fetch failed|proxy/i;

export function sh(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', timeout: 240000, env: { ...process.env, npm_config_fetch_retries: '1', npm_config_fetch_retry_mintimeout: '1000', npm_config_fetch_timeout: '20000' }, ...options });
}

let installed;
/** Packs the package and installs the tarball into an empty project, once per process. Infrastructure failures are errors (UNKNOWN), never RED. */
export function install() {
  if (installed instanceof Error) throw installed;
  if (installed) return installed;
  try {
    const work = mkdtempSync(join(tmpdir(), 'kt-xf-'));
    const pack = sh('npm', ['pack', '--ignore-scripts', '--pack-destination', work, '--json'], { cwd: PACKAGE });
    if (pack.status !== 0) throw new Error(`cannot pack the package: ${pack.stderr}`);
    const tarball = join(work, JSON.parse(pack.stdout)[0].filename);
    const project = join(work, 'project');
    mkdirSync(project);
    writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'consumer', version: '1.0.0', private: true, type: 'module' }));
    const r = sh('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts', tarball], { cwd: project });
    if (r.status !== 0) {
      const text = `${r.stderr}${r.stdout}`;
      throw new Error(`${REGISTRY_DOWN.test(text) || r.error || r.signal ? 'infrastructure' : 'install'} failure: ${text.split('\n').find((l) => l.trim())}`);
    }
    installed = { project, bin: join(project, 'node_modules/.bin/kaal-testing'), root: join(project, 'node_modules/kaal-testing') };
  } catch (error) {
    installed = error;
    throw error;
  }
  return installed;
}

/** A consumer folder with tests: one RED that someone knows about, one GREEN, one skipped, one RED that nobody knows about. */
export function fixture() {
  const { project } = install();
  const dir = mkdtempSync(join(project, 'work-'));
  writeFileSync(join(dir, 'f.test.mjs'), "import test from 'node:test';\nimport assert from 'node:assert/strict';\ntest('known bug', () => assert.equal(1, 2));\ntest('fixed', () => assert.equal(1, 1));\ntest('later', { skip: 'not built yet' }, () => {});\ntest('other bug', () => assert.equal(2, 3));\n");
  writeFileSync(join(dir, 'g.test.mjs'), "import test from 'node:test';\ntest('elsewhere', () => {});\n");
  return dir;
}

export const registerOf = (entries) => ({ schema: 'kaal-testing/expected-failures@1', expected: entries });
export const FULL = registerOf([
  { id: 'f.test.mjs > known bug', reference: 'ref-1' },
  { id: 'f.test.mjs > fixed', reference: 'ref-2' },
  { id: 'f.test.mjs > later', reference: 'ref-3' },
  { id: 'f.test.mjs > gone', reference: 'ref-4' },
  { id: 'g.test.mjs > elsewhere', reference: 'ref-5' },
]);

/** Runs the installed command on the fixture's f.test.mjs (g.test.mjs is deliberately not run) and returns { status, stdout, stderr, report }. */
export function runCommand(dir, extra = []) {
  const { bin } = install();
  const r = sh(bin, ['run', '--root', dir, ...extra, 'f.test.mjs'], { cwd: dir });
  let report;
  try { report = JSON.parse(r.stdout); } catch { report = undefined; }
  return { ...r, report };
}

/** Runs `source` as a module inside the installed project and returns its JSON output. */
export function inProject(source) {
  const { project } = install();
  const r = sh(process.execPath, ['--input-type=module', '-e', source], { cwd: project });
  return { status: r.status, stderr: r.stderr, value: r.status === 0 ? JSON.parse(r.stdout) : undefined };
}
