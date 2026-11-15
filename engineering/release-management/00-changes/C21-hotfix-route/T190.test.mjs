// Case release/T190 tests: G53
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T190';
export const tests = ['release/G53'];
export const title = 'gap release/G53 is closed: F17 states the HOTFIX route and the verdict, and A33 states how the command line reports it';
export function run() {
  const f17 = read(join(cap, '02-requirements/F17-envelope-rules/F17.md'), 'F17');
  assert.match(f17, /HOTFIX takes a head under `hotfix\/`/, 'F17 does not state the HOTFIX head');
  assert.match(f17, /base of a HOTFIX is not judged/, 'F17 does not state that the base of a HOTFIX is not judged');
  assert.doesNotMatch(f17, /HOTFIX has no route row/, 'F17 still gives HOTFIX no route row');
  assert.match(f17, /UNKNOWN never passes/, 'F17 does not state that UNKNOWN never passes');
  assert.match(f17, /`ok` alone never authorizes/, 'F17 does not state that ok alone never authorizes');
  assert.match(f17, /verdict is the only result a consumer may rely on/, 'F17 does not make the verdict authoritative');
  const a33 = read(join(cap, '03-architecture/A1-verify-plan/A2-github/A5-actions/A6-check-job/A33-check-pr-envelope/A33.md'), 'A33');
  assert.match(a33, /exit(s)? 3/, 'A33 does not state the exit code of UNKNOWN');
  assert.match(a33, /only PASS exits 0/, 'A33 does not state that only PASS exits 0');
}
