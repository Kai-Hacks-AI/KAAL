// Case engineering/T1244 tests: engineering/CTL2
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'engineering/T1244';
export const tests = ['engineering/CTL2'];
export const title = 'the control verify Layout sits in engineering/14-operations/controls, not in engineering/02-controls, and the controls checker accepts it';
export async function run() {
  const FINDER = join(root, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
  const CHECK = join(root, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
  assert.ok(!existsSync(join(root, 'engineering/02-controls/CTL2-verify-layout/CTL2.md')), 'CTL2 is still in 02-controls');
  const area = join(root, 'engineering/14-operations/controls');
  const file = join(area, 'CTL2-verify-layout/CTL2.md');
  assert.ok(existsSync(file), 'CTL2.md is absent from 14-operations/controls');
  assert.match(readFileSync(file, 'utf8'), /^evidence: \[fixture:2, real:1, provoked:1:fail\]$/m);
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, area], { encoding: 'utf8' }));
  const c = out.controls.find((x) => x.id === 'engineering/CTL2');
  assert.ok(c, 'engineering/CTL2 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(out.refused, []);
  const chk = spawnSync(process.execPath, [CHECK, area], { encoding: 'utf8' });
  assert.doesNotMatch(chk.stdout + chk.stderr, /CTL2[^\n]*(invalid|evidence)/i, 'the controls checker rejects the declaration');
}
