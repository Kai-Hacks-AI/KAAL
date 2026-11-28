// Case controls/T1733 tests: controls/F230
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pkgDir, shippedPaths } from './consumer.mjs';
export const id = 'controls/T1733';
export const tests = ['controls/F230'];
export const title = 'every relative import of a shipped script resolves to a shipped file, so an installed package never reaches a shim, a Case or a path outside what it ships';
export async function run() {
  const shipped = new Set(shippedPaths());
  const scripts = [...shipped].filter((p) => p.endsWith('.mjs'));
  assert.ok(scripts.length > 10, 'few scripts are shipped');
  const reaching = [];
  for (const p of scripts) {
    const text = readFileSync(join(pkgDir, p), 'utf8');
    for (const m of text.matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const target = relative(pkgDir, resolve(dirname(join(pkgDir, p)), m[1]));
      if (!shipped.has(target)) reaching.push(`${p} imports ${m[1]}, which is not shipped`);
    }
  }
  assert.deepEqual(reaching, [], 'a shipped script reaches a file that the package does not ship');
}
