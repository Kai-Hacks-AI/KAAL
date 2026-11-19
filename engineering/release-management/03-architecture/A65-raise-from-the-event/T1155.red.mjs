// Case release/T1155 tests: release/A65
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, SYNC, ev } from './fixtures.mjs';
export const id = 'release/T1155';
export const tests = ['release/A65'];
export const title = "the workflow reads the merge as data: closed and merged only, no pull_request_target, no checkout of the pull request, event only through env";
export async function run() {
  const src = text('05-src/wiring/workflows/dispatcher-raise.yml');
  const code = src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  assert.ok(!/pull_request_target/.test(code), 'no pull_request_target');
  assert.match(code, /pull_request:\n\s+types: \[closed\]/);
  for (const b of ['kaal/**', 'hotfix/**', 'wire/**']) assert.ok(code.includes("'" + b + "'"), b + ' is a target');
  assert.match(code, /github\.event\.pull_request\.merged == true/);
  assert.match(code, /^permissions: \{\}$/m);
  assert.match(code, /name: classify Dispatch/);
  assert.match(code, /name: raise Dispatch/);
  const uses = (code.match(/actions\/checkout@/g) || []).length;
  assert.ok(uses > 0 && (code.match(/ref: \$\{\{ github\.event\.repository\.default_branch \}\}/g) || []).length === uses, 'every checkout is the default branch');
  assert.ok(!/github\.event\.pull_request\.head/.test(code), 'the head of the pull request is never named');
  assert.ok(!code.split('\n').some((l) => /\brun:/.test(l) && /\$\{\{/.test(l)), 'no expression inside a shell command');
  assert.match(code, /if: \$\{\{ vars\.KAAL_DISPATCH_RAISE == 'on' \}\}/);
  assert.deepEqual(code.match(/permission-[a-z-]+: \w+/g), ['permission-pull-requests: write']);
  assert.match(code, /dispatch\.mjs final/);
}
