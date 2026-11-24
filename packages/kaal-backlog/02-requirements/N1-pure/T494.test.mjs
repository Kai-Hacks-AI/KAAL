// Case backlog/T494 tests: backlog/N1, backlog/A1
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-backlog');
const CHECK = join(dir, 'lib/check.mjs');
async function load() { assert.ok(existsSync(CHECK), 'lib/check.mjs is absent'); const m = await import(pathToFileURL(CHECK).href); assert.equal(typeof m.check, 'function', 'check is not exported'); return m.check; }
const item = (id, extra = {}) => ({ id, title: 'a wish', body: 'why it matters', ...extra });
const codes = (r) => r.findings.map((f) => f.code);
export const id = 'backlog/T494';
export const tests = ['backlog/N1', 'backlog/A1'];
export const title = 'the package is private 0.0.1 and its check module imports at most Foundation and touches no host state';
export function run() {
  const pkg = join(dir, 'package.json');
  assert.ok(existsSync(pkg), 'package.json is absent');
  const p = JSON.parse(readFileSync(pkg, 'utf8'));
  assert.equal(p.name, 'kaal-backlog');
  assert.equal(p.version, '0.0.1');
  assert.equal(p.private, true);
  assert.ok(existsSync(CHECK), 'lib/check.mjs is absent');
  const src = readFileSync(CHECK, 'utf8');
  const specs = [...src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  for (const s of specs) assert.equal(s, '@kaihacksai/kaal-foundation', 'imports ' + s);
  assert.doesNotMatch(src, /\b(Date|process|performance)\b|\.kaal|\bgit\b|node:/i, 'the module touches host state');
}
test(id, () => run());
