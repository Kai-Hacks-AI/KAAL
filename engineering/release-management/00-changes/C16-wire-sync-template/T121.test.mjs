// Case release/T121 tests: G48
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T121';
export const tests = ['release/G48'];
export const title = 'gap release/G48 is closed at the source: A37 is present and names the SYNC template source; the installed copy equals that source at WIRE (release/T214)';
export function run() {
  const a37 = read(join(cap, '03-architecture/A34-sync-template/A37-github/A37.md'), 'A37');
  assert.ok(a37.includes('sync.md'), 'A37 does not name the installed template');
  read(join(cap, '03-architecture/A34-sync-template/sync-template.md'), 'the capability text sync-template.md');
}
