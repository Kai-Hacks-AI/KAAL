// Case release/T1642 tests: release/C168. On merge_group each of the four has one reporter, and neither the admission nor any plain job has a merge_group trigger.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters } from './fixture.mjs';
export const id = 'release/T1642';
export const tests = ['release/C168'];
export const title = 'On merge_group each of the four has one reporter, and neither the admission nor any plain job has a merge_group trigger.';
export async function run() {
  const ws = workflows();
  for (const name of REQUIRED) { const r = reporters(ws, name, (w) => w.mergeGroup); assert.equal(r.length, 1, `${name}: ${JSON.stringify(r)}`); }
  assert.equal(reporters(ws, 'Change Isolation (review)', (w) => w.mergeGroup)[0].file, 'merge-group-review.yml');
  for (const f of ['change-isolation-plain.yml', 'branching-plain.yml', 'promotion-source-plain.yml', 'change-isolation-admission-plain.yml', 'merge-group-admission.yml']) assert.equal(ws.find((w) => w.file === f).mergeGroup, false, f);
}
