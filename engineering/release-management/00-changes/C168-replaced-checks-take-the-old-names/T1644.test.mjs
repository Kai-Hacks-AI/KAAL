// Case release/T1644 tests: release/C168. The renamed jobs keep the triggers and the entry commands they had before the change.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters } from './fixture.mjs';
export const id = 'release/T1644';
export const tests = ['release/C168'];
export const title = 'The renamed jobs keep the triggers and the entry commands they had before the change.';
export async function run() {
  const ws = workflows();
  const cmds = (t) => t.split('\n').filter((l) => /^\s+run: node /.test(l)).map((l) => l.trim());
  for (const f of ['change-isolation.yml', 'promotion-source.yml', 'merge-group-admission.yml', 'lineage-synchronization.yml']) {
    const before = parse(f, readFileSync(join(repo, '.github/workflows', f), 'utf8')); const after = ws.find((w) => w.file === f);
    assert.equal(after.onText, before.onText, `${f}: trigger`); assert.deepEqual(cmds(after.text), cmds(before.text), `${f}: entry commands`);
    assert.deepEqual(after.jobs.map((j) => j.permissions), before.jobs.map((j) => j.permissions), `${f}: permissions`);
  }
}
