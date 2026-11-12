// Case pull/T1 tests: pull/F1, pull/N1
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scriptPath } from './fixtures.mjs';
export const id = 'pull/T1';
export const tests = ['pull/F1', 'pull/N1'];
export const title = 'the Script exists, imports only built-ins and not analyze Flow, and uses no network, process, environment or write API';
export async function run() {
  const source = readFileSync(scriptPath, 'utf8');
  const imports = [...source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.ok(imports.every((name) => name.startsWith('node:')), `imports something that is not a built-in: ${imports.join(', ')}`);
  assert.ok(!imports.some((name) => /child_process|net|http|https|dns|worker_threads/.test(name)), 'imports a process or network built-in');
  assert.ok(!/analyze-flow/.test(source), 'imports or names analyze Flow: the two meet in data only');
  for (const forbidden of ['fetch(', 'process.env', 'writeFile', 'appendFile', 'createWriteStream', 'unlink', 'rmSync', 'mkdirSync', 'spawn', 'execFile', 'execSync']) {
    assert.ok(!source.includes(forbidden), `uses ${forbidden}`);
  }
  assert.match(source, /export\s+(async\s+)?function\s+pullPromotion|export\s+const\s+pullPromotion/, 'does not export pullPromotion');
}
