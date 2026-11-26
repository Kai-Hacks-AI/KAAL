// Case release/T1578 tests: release/C158. The entry of the Branching replacement integrates the adapter by the real relative specifier and recognizeIntegration recognizes it. Structure only.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = 'engineering/release-management/05-src/lineage/judge-branching.mjs';
const ADAPTER = 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
export const id = 'release/T1578';
export const tests = ['release/C158'];
export const title = 'the entry of the Branching replacement runs its check through the adapter and recognizeIntegration recognizes it';
export async function run() {
  assert.ok(existsSync(join(repo, ENTRY)), 'the entry 05-src/lineage/judge-branching.mjs is absent');
  const text = readFileSync(join(repo, ENTRY), 'utf8');
  assert.match(text, /from '(\.\.\/)+packages\/kaal-controls\/skills\/kaal-controls\/scripts\/adapter\.mjs'/, 'the entry does not import the adapter by a relative path');
  const { recognizeIntegration } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/recognize-adapter.mjs')).href);
  const r = recognizeIntegration({ control: 'release/CTL37', entry: { path: ENTRY, text }, adapter: ADAPTER, revision: 'merge' });
  assert.ok(r, 'no recognition');
  assert.notEqual(r.adapted, false, 'a recognition never says adapted: false');
}
