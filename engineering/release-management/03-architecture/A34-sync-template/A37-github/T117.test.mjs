// Case release/T117 tests: A37
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUE } from '../../../05-src/plan-body/cue.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const text = join(cap, '03-architecture/A34-sync-template/sync-template.md');
const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T117';
export const tests = ['release/A37'];
export const title = 'the SYNC template installed in GitHub is the text of the capability, byte for byte';
export function run() {
  // Transitional (release/C24): until release/C25 installs the cue, the installed copy lacks the cue line and both sides are compared without it.
  // Once the installed copy carries the cue, the comparison is strict, byte for byte. release/C25 deletes this branch and a Case of C25 fails while it remains.
  const capability = read(text, 'the capability text sync-template.md');
  const copy = read(installed, 'the installed SYNC template');
  if (copy.split('\n').includes(CUE)) assert.equal(copy, capability);
  else assert.equal(copy, capability.split('\n').filter((line) => line !== CUE).join('\n').replace(/^\n+/, ''));
}
