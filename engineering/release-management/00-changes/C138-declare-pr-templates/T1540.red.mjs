// Case release/T1540 tests: release/C138
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SOURCES = join(repo, 'engineering/release-management/05-src/wiring/templates');
const TYPES = ['PLAN', 'DO', 'ACT', 'SYNC', 'PROMOTION', 'HOTFIX']; // WIRE opens with Source, not Change, so release/F17 gives it no declaration
export const id = 'release/T1540';
export const tests = ['release/C138'];
export const title = 'the template sources declare one TYPE each and the reader derives the six TYPEs from them without a finding';
export async function run() {
  assert.ok(existsSync(SOURCES), 'the template sources are absent');
  const { readTemplates } = await import(join(repo, 'engineering/release-management/05-src/plan-body/templates.mjs'));
  const files = readdirSync(SOURCES).filter((f) => f.endsWith('.md')).map((f) => ({ path: `.github/PULL_REQUEST_TEMPLATE/${f}`, text: readFileSync(join(SOURCES, f), 'utf8') }));
  const { registry, findings } = readTemplates(files);
  assert.deepEqual(findings, [], 'the reader found a fault in the sources');
  assert.deepEqual(Object.keys(registry).sort(), [...TYPES].sort(), 'the sources do not declare exactly the six TYPEs');
  for (const t of TYPES) assert.equal(registry[t][0], 'Change', `${t} must open with the chapter Change`);
  for (const f of files.filter((x) => !x.path.endsWith('/wire.md'))) assert.equal(f.text.split('\n')[0].startsWith('<!-- KAAL-PR-template: '), true, `${f.path} must open with its declaration`);
}
