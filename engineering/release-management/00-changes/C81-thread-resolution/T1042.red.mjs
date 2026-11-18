// Case release/T1042 tests: release/CTL10
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const IFACE = readFileSync(join(RM, '00-changes/C81-thread-resolution/interface.md'), 'utf8');
const draft = (name) => IFACE.split(new RegExp('^## Draft of ' + name.replace('.', '\\.') + '$', 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1042';
export const tests = ['release/CTL10'];
export const title = 'the chain of the thread Intent: I46, F63 (serves I46), A58 (addresses F63) and release/CTL10 (has I36 and I46) equal their drafts';
export async function run() {
  const at = { 'I46.md': '01-intent', 'F63.md': '02-requirements', 'A58.md': '03-architecture' };
  for (const [f, dir] of Object.entries(at)) {
    const hits = readdirSync(join(RM, dir)).filter((n) => n.startsWith(f.split('.')[0] + '-'));
    assert.equal(hits.length, 1, `${f} is absent from ${dir}`);
    assert.ok(existsSync(join(RM, dir, hits[0], f)), `${f} is absent from ${dir}/${hits[0]}`);
    assert.equal(readFileSync(join(RM, dir, hits[0], f), 'utf8'), `${draft(f)}\n`, `${f} differs from the draft`);
  }
  const ctl = join(RM, '04-controls/CTL10-approve-integration/CTL10.md');
  assert.equal(readFileSync(ctl, 'utf8'), `${draft('CTL10.md')}\n`, 'CTL10.md differs from the draft');
  assert.match(readFileSync(ctl, 'utf8'), /^has: \[release\/I36, release\/I46\]$/m, 'CTL10 does not have both Intents');
}
