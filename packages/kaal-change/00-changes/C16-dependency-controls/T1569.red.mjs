// Case change/T1569 tests: change/G19
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'change/T1569';
export const tests = ['change/G19'];
export const closes = ['change/G19'];
export const title = 'each control has an entry that runs its judge through the adapter, and recognizeIntegration recognizes it (structure only)';
export async function run() {
  const ADAPTER = 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
  const { recognizeIntegration } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/recognize-adapter.mjs')).href);
  for (const [name, control] of [['check-predecessor', 'change/CTL1'], ['identify-conflict', 'change/CTL2']]) {
    const path = `packages/kaal-change/13-source/controls/run-${name}.mjs`;
    assert.ok(existsSync(join(repo, path)), `the entry ${path} is absent`);
    const text = readFileSync(join(repo, path), 'utf8');
    assert.match(text, new RegExp(`from '(\\.\\./)+kaal-controls/skills/kaal-controls/scripts/adapter\\.mjs'`), `${path} does not import the adapter by a relative path`);
    assert.match(text, new RegExp(`from '\\.\\./\\.\\./lib/${name}\\.mjs'`), `${path} does not run the judge of lib/${name}.mjs`);
    const r = recognizeIntegration({ control, entry: { path, text }, adapter: ADAPTER, revision: 'merge' });
    assert.equal(r.integration, 'recognized');
    assert.equal(r.control, control);
  }
}
test(id, () => run());
