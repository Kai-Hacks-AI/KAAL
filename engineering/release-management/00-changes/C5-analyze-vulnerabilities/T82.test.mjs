// Case release/T82 tests: G22
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T82';
export const tests = ['release/G22'];
export const title = 'gap release/G22 is closed: a dependency check is declared for its place, under whatever name is picked';
export function run() {
  const dir = join(repo, '.kaal/config/guard');
  const files = existsSync(dir) ? readdirSync(dir) : [];
  const hit = files.filter((f) => { const d = readFileSync(join(dir, f), 'utf8'); const fm = d.split('---')[1] ?? ''; return /dependenc|vulnerab/i.test(`${f} ${d}`) && /^runs: \\[.*\\bci\\b.*\\]$/m.test(fm); });
  assert.ok(hit.length > 0, 'no Guard declaration runs a dependency check in ci');
}
