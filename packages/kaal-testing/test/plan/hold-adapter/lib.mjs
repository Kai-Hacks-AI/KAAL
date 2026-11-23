// Helpers for the testing/C74 planned Cases. They build throwaway trees and reports in a temp directory and never touch the repository.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
/** Override with KAAL_TESTING_IMPL when validating the Cases against a reference implementation outside the repository. */
export const LIB = process.env.KAAL_TESTING_IMPL ? resolve(process.env.KAAL_TESTING_IMPL) : join(PKG, 'lib');

/** Imports lib/<name>.mjs after asserting it exists, so that on main a Case is RED by assertion and never a load error. */
export async function load(name) {
  const file = join(LIB, `${name}.mjs`);
  assert.ok(existsSync(file), `missing: ${file}`);
  return import(pathToFileURL(file).href);
}

/** A tree of files in a fresh temp directory: { 'a/b.txt': 'text' } -> its root. */
export function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'kaal-hold-'));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(root, dirname(rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}

export const caseText = (id, tests = ['testing/F1'], q = "'") => `export const id = ${q}${id}${q};\nexport const tests = [${tests.map((t) => `${q}${t}${q}`).join(', ')}];\nexport function run() {}\n`;

/** A minimal kaal-testing/run-report@1: tests are { file, actual, reason? }; problems are { file, kind }. */
export function report({ tests = [], problems = [], files, complete } = {}) {
  const unique = files ?? [...new Set(tests.map((t) => t.file))];
  const counts = { GREEN: 0, RED: 0, UNKNOWN: 0 };
  for (const t of tests) counts[t.actual] += 1;
  return {
    schema: 'kaal-testing/run-report@1',
    counts,
    tests: tests.map((t, i) => ({ path: [], name: `t${i}`, role: 'leaf', order: i, ...t })),
    diagnostics: [],
    execution: { complete: complete ?? problems.length === 0, timeoutMs: 300000, node: process.versions.node, files: unique, problems },
  };
}

export const REV = '0123456789abcdef0123456789abcdef01234567';
export const OTHER = 'fedcba9876543210fedcba9876543210fedcba98';
