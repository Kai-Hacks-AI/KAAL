// Helpers for the testing/C63 planned Cases. They read the package and run fixtures; the runner under test writes nothing under the root.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
/** Where the runner lives. Validation only: KAAL_TESTING_IMPL points at a throwaway reference outside the repository. */
export const IMPL = process.env.KAAL_TESTING_IMPL ? resolve(process.env.KAAL_TESTING_IMPL) : PKG;
export const PARTS = ['lib/run.mjs', 'lib/run-reporter.mjs', 'bin/kaal-testing.mjs'];
export const SCHEMA = 'kaal-testing/run-report@1';
export const fx = (name) => `test/plan/run-cases/fixtures/${name}.fixture.mjs`;

/** Asserts the runner exists, before any import, so that a missing runner is RED by assertion and never a load error. */
export function present() {
  for (const p of PARTS) assert.ok(existsSync(join(IMPL, p)), `missing: ${p} (the runner is not delivered yet)`);
}
export async function load() {
  present();
  return import(pathToFileURL(join(IMPL, 'lib/run.mjs')).href);
}
/** Runs fixtures by name through runCases and returns the report. */
export async function runFx(names, opts = {}) {
  const { runCases } = await load();
  return runCases({ files: names.map(fx), root: PKG, ...opts });
}
export const tail = (t) => t.id.split(' > ').slice(1).join(' > ');
/** The test of `report` whose id ends with the given path of names within the file. */
export function find(report, file, names) {
  return report.tests.find((t) => t.id === [fx(file), ...[].concat(names)].join(' > '));
}
export const names = (report) => report.tests.map(tail).sort();
export function cli(args, opts = {}) {
  present();
  return spawnSync(process.execPath, [join(IMPL, 'bin/kaal-testing.mjs'), ...args], { cwd: PKG, encoding: 'utf8', ...opts });
}
export const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
