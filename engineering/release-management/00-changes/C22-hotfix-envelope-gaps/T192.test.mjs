// Case release/T192 tests: G54
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const id = 'release/T192';
export const tests = ['release/G54'];
export const title = 'gap release/G54 is closed: F17 states that a hotfix/ head is promoted (release/C67), what a HOTFIX needs, and what stays unjudged';
export function run() {
  const path = join(cap, '02-requirements/F17-envelope-rules/F17.md');
  assert.ok(existsSync(path), 'F17 is absent');
  const f17 = readFileSync(path, 'utf8');
  assert.match(f17, /from a `hotfix\/` head must be a PROMOTION into `main`/, 'F17 does not state that a hotfix/ head is promoted'); // release/C67
  assert.match(f17, /Defect, Urgency and Approach[^.]*(content|empty)/i, 'F17 does not state that the Defect, Urgency and Approach chapters need content');
  assert.match(f17, /Change chapter of a HOTFIX is one line/, 'F17 does not state the shape of the HOTFIX Change chapter');
  assert.match(f17, /corrects only its defect/, 'F17 does not list defect-only scope as not judged');
}
