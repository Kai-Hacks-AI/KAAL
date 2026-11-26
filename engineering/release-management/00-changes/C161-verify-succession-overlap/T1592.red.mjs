// Case release/T1592 tests: release/C161. Each entry of verify Succession and verify Overlap integrates the adapter by the real relative specifier and recognizeIntegration recognizes it. Structure only.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1592';
export const tests = ['release/C161'];
export const title = 'each entry of verify Succession and verify Overlap runs its check through the adapter and recognizeIntegration recognizes it';
export async function run() {
  const ADAPTER = 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
  const { recognizeIntegration } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/recognize-adapter.mjs')).href);
  for (const [name, control] of [['succession', 'release/CTL43'], ['overlap', 'release/CTL44']]) {
    const ENTRY = `engineering/release-management/05-src/succession/judge-${name}.mjs`;
    assert.ok(existsSync(join(repo, ENTRY)), `the entry ${ENTRY} is absent`);
    const text = readFileSync(join(repo, ENTRY), 'utf8');
    assert.match(text, /from '(\.\.\/)+packages\/kaal-controls\/skills\/kaal-controls\/scripts\/adapter\.mjs'/, `${ENTRY} does not import the adapter by a relative path`);
    const r = recognizeIntegration({ control, entry: { path: ENTRY, text }, adapter: ADAPTER, revision: 'merge' });
    assert.ok(r, 'no recognition');
    assert.notEqual(r.adapted, false, `${ENTRY}: a recognition never says adapted: false`);
  }
}
