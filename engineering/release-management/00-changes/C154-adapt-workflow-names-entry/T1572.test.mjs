// Case release/T1572 tests: release/C154. The delivered entry of CTL36 shows a recognizable integration with the adapter: it imports runControl from the adapter module by the real
// relative specifier, which climbs out of the entry's folder, and every occurrence of runControl is a call. Structure only.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = 'engineering/release-management/05-src/workflow-names/judge-workflow-names.mjs';
const ADAPTER = 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
export const id = 'release/T1572';
export const tests = ['release/C154'];
export const title = 'the entry of CTL36 integrates the adapter by the real relative specifier that climbs out of its folder, and recognizeIntegration recognizes it';
export async function run() {
  const { recognizeIntegration } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/recognize-adapter.mjs')).href);
  const text = readFileSync(join(repo, ENTRY), 'utf8');
  assert.match(text, /from '(\.\.\/)+packages\/kaal-controls\/skills\/kaal-controls\/scripts\/adapter\.mjs'/, 'the entry does not import the adapter by a relative path that climbs out of its folder');
  const r = recognizeIntegration({ control: 'release/CTL36', entry: { path: ENTRY, text }, adapter: ADAPTER, revision: 'merge' });
  assert.ok(r, 'no recognition');
  assert.notEqual(r.adapted, false, 'a recognition never says adapted: false');
}
