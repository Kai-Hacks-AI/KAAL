// Case controls/T779 tests: controls/A11
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
export const id = 'controls/T779';
export const tests = ['controls/A11'];
export const title = 'Engineering keeps migration guidance and no copy of the rule, and points at the product check';
export async function run() {
  const md = join(repo, 'engineering/controls/03-architecture/A11-check-deployed/migration.md');
  assert.ok(existsSync(md), 'the migration guidance is absent');
  const text = readFileSync(md, 'utf8');
  assert.ok(text.includes('packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs'), 'the guidance does not point at the product check');
  assert.ok(text.includes('references/declaring-controls.md'), 'the guidance does not point at the product reference');
  assert.ok(existsSync(CHECK), 'the product check is absent');
  const { DIRT } = await import(pathToFileURL(CHECK).href);
  assert.equal(DIRT.length, 4, 'the product check does not export the four values');
  const copies = [];
  const walk = (d) => { for (const n of readdirSync(d, { withFileTypes: true })) { const p = join(d, n.name); if (n.isDirectory()) walk(p); else if (/\.mjs$/.test(n.name) && DIRT.filter((s) => readFileSync(p, 'utf8').includes(`'${s}'`)).length > 1) copies.push(n.name); } };
  walk(join(repo, 'engineering/controls'));
  assert.deepEqual(copies, [], 'engineering holds a copy of the four values');
}
