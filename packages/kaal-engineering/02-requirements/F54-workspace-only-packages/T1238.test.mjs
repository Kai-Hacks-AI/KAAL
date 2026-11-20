// Case engineering/T1238 tests: engineering/F54
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const script = join(pkg, 'skills/kaal-engineering/scripts/check-layout.mjs');
const present = () => assert.ok(existsSync(script), 'the check skills/kaal-engineering/scripts/check-layout.mjs is absent');
// A scratch capability folder: a git repository holding exactly these files, all tracked.
const fixture = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'layout-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), 'x\n'); }
  execFileSync('git', ['-C', dir, 'init', '-q']);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  return dir;
};
const judge = (dir) => { present(); const r = spawnSync(process.execPath, [script, '--workspace', dir], { encoding: 'utf8' }); return { code: r.status, out: r.stdout.trim() }; };
const GOOD = ['AGENTS.md', 'README.md', 'kaal-a/package.json', 'kaal-a/10-intent/I1.md', 'kaal-b/package.json'];
export const id = 'engineering/T1238';
export const tests = ['engineering/F54'];
export const title = 'the workspace allows packages, AGENTS.md and README.md, and names any other file or numbered folder';
export async function run() {
  assert.equal(judge(fixture(GOOD)).code, 0);
  const file = judge(fixture([...GOOD, 'notes.md']));
  assert.equal(file.code, 1);
  assert.match(file.out, /notes\.md/);
  const folder = judge(fixture([...GOOD, '02-controls/CTL1.md']));
  assert.equal(folder.code, 1);
  assert.match(folder.out, /02-controls/);
  assert.equal(judge(fixture(['x.txt'])).code, 1);
}
