// Case release/T1580 tests: release/C159. The entry of the Promotion Source replacement integrates the adapter by the real relative specifier and recognizeIntegration recognizes it. Structure only.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = 'engineering/release-management/05-src/promotion-source/judge-promotion-source.mjs';
const ADAPTER = 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
export const id = 'release/T1580';
export const tests = ['release/C159'];
export const title = 'the entry of the Promotion Source replacement runs its check through the adapter and recognizeIntegration recognizes it';
export async function run() {
  assert.ok(existsSync(join(repo, ENTRY)), 'the entry 05-src/promotion-source/judge-promotion-source.mjs is absent');
  const text = readFileSync(join(repo, ENTRY), 'utf8');
  assert.match(text, /from '(\.\.\/)+packages\/kaal-controls\/skills\/kaal-controls\/scripts\/adapter\.mjs'/, 'the entry does not import the adapter by a relative path');
  const { recognizeIntegration } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/recognize-adapter.mjs')).href);
  const r = recognizeIntegration({ control: 'release/CTL38', entry: { path: ENTRY, text }, adapter: ADAPTER, revision: 'merge' });
  assert.ok(r, 'no recognition');
  assert.notEqual(r.adapted, false, 'a recognition never says adapted: false');
}
