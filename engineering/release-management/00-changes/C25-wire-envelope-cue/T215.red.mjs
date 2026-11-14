// Case release/T215 tests: G58
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const id = 'release/T215';
export const tests = ['release/G58'];
export const title = 'gap release/G58 is closed in the SYNC Cases: T117 and T121 judge the source, read no installed file and keep no transitional cue branch';
export function run() {
  for (const rel of ['03-architecture/A34-sync-template/A37-github/T117.test.mjs', '00-changes/C16-wire-sync-template/T121.test.mjs']) {
    const text = readFileSync(join(cap, rel), 'utf8');
    assert.doesNotMatch(text, /CUE|cue\.mjs|Transitional/, `${rel} still names the cue or keeps the transitional branch`);
    assert.doesNotMatch(text, /PULL_REQUEST_TEMPLATE\/sync\.md/, `${rel} still reads the installed SYNC template`);
  }
}
