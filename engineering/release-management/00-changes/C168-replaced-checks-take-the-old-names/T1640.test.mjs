// Case release/T1640 tests: release/C168. For a pull request event the workflow files give exactly one reporter for each of the four required contexts.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters } from './fixture.mjs';
export const id = 'release/T1640';
export const tests = ['release/C168'];
export const title = 'For a pull request event the workflow files give exactly one reporter for each of the four required contexts.';
export async function run() {
  const ws = workflows();
  for (const name of REQUIRED) {
    const r = reporters(ws, name, (w) => w.pullRequest || w.target);
    assert.equal(r.length, 1, `${name}: ${JSON.stringify(r)}`);
    assert.equal(ws.find((w) => w.file === r[0].file).target, false, `${name} is reported by a pull_request_target job`);
  }
}
