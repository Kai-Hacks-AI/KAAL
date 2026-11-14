// Case release/T204 tests: A45
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).sort() : []);
export const id = 'release/T204';
export const tests = ['release/A45'];
export const title = 'every installed wiring workflow is its source, byte for byte';
export function run() {
  const sources = list(join(wiring, 'workflows'), '.yml');
  assert.ok(sources.length > 0, 'no workflow source is present');
  for (const f of sources) {
    const installed = join(repo, '.github/workflows', `release-${f}`);
    assert.ok(existsSync(installed), `${f} is not installed`);
    assert.equal(readFileSync(installed, 'utf8'), readFileSync(join(wiring, 'workflows', f), 'utf8'), `the installed ${f} differs from its source`);
  }
}
