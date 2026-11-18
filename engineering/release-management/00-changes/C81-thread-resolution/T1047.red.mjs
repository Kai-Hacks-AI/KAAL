// Case release/T1047 tests: release/C81
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const folder = (dir, p) => readdirSync(join(RM, dir)).find((n) => n.startsWith(p + '-'));
const read = (dir, p) => { const f = folder(dir, p); assert.ok(f && existsSync(join(RM, dir, f, p + '.md')), p + ' is absent from ' + dir); return readFileSync(join(RM, dir, f, p + '.md'), 'utf8'); };
const flat = (s) => s.replace(/\s+/g, ' ');
export const id = 'release/T1047';
export const tests = ['release/C81'];
export const title = 'the DO kept its obligation: T860 and T862 still exist, are not skipped, and read the current target, not the C66 draft';
export async function run() {
  const t860 = join(RM, '04-controls/CTL10-approve-integration');
  const t862 = join(RM, '00-changes/C66-integration-approval');
  const files = [join(t860, 'T860.test.mjs'), existsSync(join(t862, 'T862.test.mjs')) ? join(t862, 'T862.test.mjs') : join(RM, '04-controls/CTL10-approve-integration/T862.test.mjs')];
  for (const f of files) {
    assert.ok(existsSync(f), `${f} is gone`);
    assert.doesNotMatch(readFileSync(f, 'utf8'), /\b(skip|todo)\b\s*[:(]|\.skip\(|\.todo\(/, `${f} is skipped`);
  }
  assert.match(readFileSync(files[0], 'utf8'), /release\/I46/, 'T860 does not read the Intent I46');
  assert.doesNotMatch(readFileSync(files[1], 'utf8'), /Draft of integrating\.json/, 'T862 still reads the C66 draft');
}
