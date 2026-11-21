// Case testing/T401 tests: testing/CTL1
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C80-verify-case/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T401';
export const tests = ['testing/CTL1'];
export const title = 'the finder lists testing/CTL1 as the detective control verify Case with testing/I48 and check-controls accepts engineering/testing, equal to its draft';

export async function run() {
  const real = join(ET, '14-operations/controls/CTL1-verify-case/CTL1.md');
  assert.ok(existsSync(real), 'CTL1.md is absent');
  assert.equal(norm(readFileSync(real, 'utf8')), `${draft('CTL1.md')}\n`, 'CTL1.md differs from the draft');

  const out = JSON.parse(execFileSync(process.execPath, [FINDER, ET], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], `unexpected refused controls: ${JSON.stringify(out.refused)}`);
  const c = out.controls.find((x) => x.id === 'testing/CTL1');
  assert.ok(c, 'testing/CTL1 is not listed');
  assert.equal(c.type, 'detective');
  assert.equal(c.status, 'designed');
  assert.deepEqual(c.has, ['testing/I48']);
  assert.deepEqual(c.evidence, [
    { kind: 'fixture', runs: 2, fail: false },
    { kind: 'real', runs: 1, fail: false },
    { kind: 'provoked', runs: 1, fail: true },
  ]);

  const chk = execFileSync(process.execPath, [CHECK, ET], { encoding: 'utf8' });
  assert.match(chk, /^testing\/CTL1 designed valid /m);
}
