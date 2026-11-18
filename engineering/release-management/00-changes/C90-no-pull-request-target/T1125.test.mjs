// Case release/T1125 tests: release/G112
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/triggers/verify-triggers.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C90-no-pull-request-target/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1125';
export const tests = ['release/G112'];
export const title = 'the gap is closed: each of the five recorded workflows would be refused if it were added now';
export async function run() {
  const { judge, uses } = await load();
  const rec = readFileSync(join(RM, '00-changes/C90-no-pull-request-target/baseline.md'), 'utf8').split(/^## From \(recorded\)$/m)[1];
  const files = [...rec.matchAll(/^- `(\.github\/workflows\/[a-z-]+\.yml)`/gm)].map((m) => m[1]);
  assert.equal(files.length, 5, 'the five recorded workflows are not listed');
  for (const f of files) {
    const text = readFileSync(join(repo, f), 'utf8');
    assert.equal(uses(text), true, `${f} no longer uses the trigger: retire this Case`);
    const r = judge({ base: { '.github/workflows/other.yml': 'on: pull_request\n' }, head: { '.github/workflows/other.yml': 'on: pull_request\n', [f]: text } });
    assert.equal(r.verdict, 'FAIL', `${f} would not be refused`);
  }
}
