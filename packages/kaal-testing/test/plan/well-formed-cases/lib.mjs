// Helpers for the testing/C69 planned Cases. They pack the package, install it into an empty project and observe the installed copy.
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
    const work = mkdtempSync(join(tmpdir(), 'kt-wf-'));
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


const GOOD = (n, target) => `// Case testing/T${n} tests: ${target}. A well formed Case.\nexport const id = 'testing/T${n}';\nexport const tests = ['${target}'];\n`;
/** Case files as a consumer folder holds them: each entry is a file name and its text. */
export const CASES = {
  good: { 'T900.test.mjs': GOOD(900, 'testing/F1') },
  noFirstLine: { 'T901.test.mjs': "import test from 'node:test';\ntest('testing/T901 something', () => {});\n" },
  twoTargets: { 'T902.test.mjs': GOOD(902, 'testing/F1, testing/F2') },
  duplicateId: { 'T903.test.mjs': GOOD(903, 'testing/F1'), 'T903b.test.mjs': GOOD(903, 'testing/F2') },
  unknownTarget: { 'T904.test.mjs': GOOD(904, 'testing/F99') },
  idDisagrees: { 'T905.test.mjs': "// Case testing/T905 tests: testing/F1\nexport const id = 'testing/T906';\n" },
  badId: { 'T907.test.mjs': '// Case T907 tests: testing/F1\n' },
};

/** Writes `files` into a fresh folder in the installed project. */
export function folder(files) {
  const { project } = install();
  const dir = mkdtempSync(join(project, 'cases-'));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

/** Runs `kaal-testing check-cases` in the installed package: { status, stdout, stderr, report }. */
export function checkCommand(dir, elements, extra = []) {
  const { bin } = install();
  const args = ['check-cases', '--root', dir];
  if (elements) {
    writeFileSync(join(dir, '.elements.json'), JSON.stringify(elements));
    args.push('--elements', join(dir, '.elements.json'));
  }
  const files = readdirSync(dir).filter((n) => /\.m?js$/.test(n)).sort();
  const r = sh(bin, [...args, ...extra, ...files], { cwd: dir });
  let report;
  try { report = JSON.parse(r.stdout); } catch { report = undefined; }
  return { ...r, report };
}
export const ELEMENTS = ['testing/F1', 'testing/F2', 'testing/F3'];
export const kinds = (report) => (report?.findings ?? []).map((f) => f.kind).sort();
