// Case release/T1582 tests: release/C160. The entry of the Change Isolation (check 1) replacement integrates the adapter by the real relative specifier and recognizeIntegration recognizes it. Structure only.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRIES = [['github-alone', 'release/CTL42'], ['delivery', 'release/CTL23']].map(([v, c]) => [`engineering/release-management/05-src/change-isolation/judge-${v}.mjs`, c]);
const ADAPTER = 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
export const id = 'release/T1582';
export const tests = ['release/C160'];
export const title = 'each of the two entries of the Change Isolation (check 1) replacement runs its check through the adapter and recognizeIntegration recognizes it';
export async function run() {
  const { recognizeIntegration } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/recognize-adapter.mjs')).href);
  for (const [ENTRY, control] of ENTRIES) {
    assert.ok(existsSync(join(repo, ENTRY)), `the entry ${ENTRY} is absent`);
    const text = readFileSync(join(repo, ENTRY), 'utf8');
    assert.match(text, /from '(\.\.\/)+packages\/kaal-controls\/skills\/kaal-controls\/scripts\/adapter\.mjs'/, `${ENTRY} does not import the adapter by a relative path`);
    const r = recognizeIntegration({ control, entry: { path: ENTRY, text }, adapter: ADAPTER, revision: 'merge' });
    assert.ok(r, 'no recognition');
    assert.notEqual(r.adapted, false, `${ENTRY}: a recognition never says adapted: false`);
  }
}
