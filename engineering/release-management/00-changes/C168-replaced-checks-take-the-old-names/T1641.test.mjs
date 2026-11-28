// Case release/T1641 tests: release/C168. The old jobs carry the marker (legacy in their names, are no required context, and are not removed.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters } from './fixture.mjs';
export const id = 'release/T1641';
export const tests = ['release/C168'];
export const title = 'The old jobs carry the marker (legacy in their names, are no required context, and are not removed.';
export async function run() {
  const ws = workflows();
  for (const [file, base] of [['change-isolation.yml', 'Change Isolation'], ['lineage-synchronization.yml', 'Branching'], ['promotion-source.yml', 'Promotion Source'], ['merge-group-admission.yml', 'Change Isolation (review)']]) {
    const w = ws.find((x) => x.file === file); assert.ok(w, `${file} is kept`);
    assert.equal(w.target, true, `${file} still runs on pull_request_target`);
    const j = w.jobs.filter((x) => x.name?.includes('(legacy')); assert.equal(j.length, 1, file);
    assert.ok(j[0].name.startsWith(base), j[0].name); assert.equal(REQUIRED.includes(j[0].name), false);
  }
}
