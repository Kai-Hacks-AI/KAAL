// Case release/T1273 tests: release/CTL25, release/CTL26
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C105-hold-history/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1273';
export const tests = ['release/CTL25', 'release/CTL26'];
export const title = 'the finder lists release/CTL25 hold History as a preventive and release/CTL26 verify History held as a detective control that have release/I54, equal to their drafts, with the declared evidence accepted by the controls checker, and no longer lists release/CTL22';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  for (const [cid, type, dir, name] of [['release/CTL25', 'preventive', 'CTL25-hold-history', 'hold History'], ['release/CTL26', 'detective', 'CTL26-verify-history-held', 'verify History held']]) {
    const c = out.controls.find((x) => x.id === cid);
    assert.ok(c, `${cid} is not listed`);
    assert.equal(c.type, type);
    assert.equal(c.title, name);
    assert.deepEqual(c.has, ['release/I54']);
    assert.equal(readFileSync(join(RM, `04-controls/${dir}/${cid.split('/')[1]}.md`), 'utf8'), `${draft(`${cid.split('/')[1]}.md`)}\n`, `${cid} differs from its draft`);
  }
  assert.ok(!out.controls.some((x) => x.id === 'release/CTL22'), 'release/CTL22 is still listed');
  const chk = spawnSync(process.execPath, [CHECK, RM], { encoding: 'utf8' });
  assert.doesNotMatch(chk.stdout + chk.stderr, /CTL2[56][^\n]*(invalid|evidence)/i, 'the controls checker rejects a declaration');
}
