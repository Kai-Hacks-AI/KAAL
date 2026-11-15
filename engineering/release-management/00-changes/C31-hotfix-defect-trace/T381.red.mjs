// Case release/T381 tests: G66
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T381';
export const tests = ['release/G66'];
export const title = 'gap release/G66 is closed: F16 states the trace from HOTFIX to Defect to reproducing Case, the RED-then-GREEN evidence and what stays unjudged';

export function run() {
  const path = join(repo, 'engineering/release-management/02-requirements/F16-hotfix-interface/F16.md');
  assert.ok(existsSync(path), 'F16 is absent');
  const f16 = readFileSync(path, 'utf8');
  assert.match(f16, /one Hotfix corrects one identified (KAAL )?Defect/i, 'F16 does not state one HOTFIX, one defect');
  assert.match(f16, /reproducing Case[^.]*(need not|not required)[^.]*diff|(need not|not required)[^.]*diff[^.]*reproducing Case/i, 'F16 does not state that the reproducing Case need not be in the diff');
  assert.match(f16, /several capability roots[^.]*(justif|reviewer)/i, 'F16 does not state that several capability roots are flagged for justification');
  assert.match(f16, /RED against the (defect-bearing )?baseline and GREEN against the corrected revision/i, 'F16 does not state the baseline and head evidence');
  assert.match(f16, /(missing|stale)[^.]*evidence[^.]*UNKNOWN|UNKNOWN[^.]*(missing|stale)/i, 'F16 does not state that missing or stale evidence is UNKNOWN');
  assert.match(f16, /corresponds to the Defect/, 'F16 does not list the Case-to-Defect correspondence as not judged');
  assert.match(f16, /minimal/, 'F16 does not list minimality as not judged');
}
