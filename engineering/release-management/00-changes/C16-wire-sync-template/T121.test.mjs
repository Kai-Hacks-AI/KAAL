// Case release/T121 tests: G48
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUE } from '../../05-src/plan-body/cue.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const text = join(cap, '03-architecture/A34-sync-template/sync-template.md');
const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T121';
export const tests = ['release/G48'];
export const title = 'gap release/G48 is closed: A37 is present and the installed template is the capability text';
export function run() {
  read(join(cap, '03-architecture/A34-sync-template/A37-github/A37.md'), 'A37');
  // Transitional (release/C24): until release/C25 installs the cue, the installed copy lacks the cue line and both sides are compared without it.
  // Once the installed copy carries the cue, the comparison is strict, byte for byte. release/C25 deletes this branch and a Case of C25 fails while it remains.
  const capability = read(text, 'the capability text sync-template.md');
  const copy = read(installed, 'the installed SYNC template');
  if (copy.split('\n').includes(CUE)) assert.equal(copy, capability);
  else assert.equal(copy, capability.split('\n').filter((line) => line !== CUE).join('\n').replace(/^\n+/, ''));
}
