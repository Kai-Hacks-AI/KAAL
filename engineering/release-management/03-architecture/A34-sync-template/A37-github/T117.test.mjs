// Case release/T117 tests: A37
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const text = join(cap, '03-architecture/A34-sync-template/sync-template.md');
export const id = 'release/T117';
export const tests = ['release/A37'];
export const title = 'the SYNC template source that is installed in GitHub exists and holds the SYNC chapters; the installed copy equals it at WIRE (release/T214)';
export function run() {
  assert.ok(existsSync(text), 'the capability text sync-template.md is absent');
  const headings = readFileSync(text, 'utf8').split('\n').filter((line) => /^## \S/.test(line));
  assert.deepEqual(headings, ['## Change', '## Reason'], 'the SYNC template source does not hold exactly the chapters Change and Reason');
}
