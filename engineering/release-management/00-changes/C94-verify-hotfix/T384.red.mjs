// Case release/T384 tests: release/F71 (the Run of Cases, end to end, on two plain directories)
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/hotfix/verify-hotfix.mjs');
const load = () => import(pathToFileURL(MOD).href);

const RUNNER = join(repo, 'packages/kaal-testing/bin/kaal-testing.mjs');
export const id = 'release/T384';
export const tests = ['release/F71', 'release/A66'];
export const title = 'on two plain directories, no Git: the same Case, brought by the Hotfix, is run by the Run of Cases on the before tree (its file copied over) and on the after tree, and RED then GREEN is PASS; a Case that is GREEN before, or still RED after, is a finding';
export async function run() {
  assert.ok(existsSync(MOD), 'the verify Hotfix module is absent');
  assert.ok(existsSync(RUNNER), 'the Run of Cases is absent');
  assert.ok(Number(process.versions.node.split('.')[0]) >= 24, 'the Run of Cases requires Node 24');
  const root = mkdtempSync(join(tmpdir(), 'hotfix-run-'));
  const make = (name, source) => {
    const dir = join(root, name);
    mkdirSync(join(dir, 'packages/kaal-demo/src'), { recursive: true });
    writeFileSync(join(dir, 'packages/kaal-demo/src/add.mjs'), source);
    return dir;
  };
  const before = make('before', 'export const add = (a, b) => a - b;\n');
  const after = make('after', 'export const add = (a, b) => a + b;\n');
  const put = (dir, p, text) => { mkdirSync(join(dir, p, '..'), { recursive: true }); writeFileSync(join(dir, p), text); };
  // the Hotfix brings its Defect record and its Case, in the after tree only
  put(after, 'packages/kaal-demo/06-defects/D1-add.md', '# demo/D1\n\n```json\n{"id":"demo/D1","tests":["demo/T1"]}\n```\n');
  put(after, 'packages/kaal-demo/06-defects/add.test.mjs', "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { add } from '../src/add.mjs';\ntest('demo/T1: add adds', () => { assert.equal(add(2, 3), 5); });\n");
  writeFileSync(join(root, 'body.md'), '## Defect\n\ndemo/D1 add subtracts.\n');
  const node = (...a) => execFileSync(process.execPath, [MOD, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const common = ['--before', before, '--after', after, '--body-file', join(root, 'body.md')];
  assert.equal(node('cases', '--after', after, '--body-file', join(root, 'body.md')).trim(), 'packages/kaal-demo/06-defects/add.test.mjs');
  const runs = join(root, 'runs');
  for (const on of ['before', 'after']) node('run', '--on', on, ...common, '--runner', RUNNER, '--out', join(runs, `${on}.json`));
  const rb = JSON.parse(readFileSync(join(runs, 'before.json'), 'utf8'));
  const ra = JSON.parse(readFileSync(join(runs, 'after.json'), 'utf8'));
  assert.equal(rb.counts.RED, 1, 'the Case is not RED on the before tree');
  assert.equal(ra.counts.GREEN, 1, 'the Case is not GREEN on the after tree');
  const verdict = (b, a) => node('--after', after, '--body-file', join(root, 'body.md'), '--before-run', b, '--after-run', a);
  assert.match(verdict(join(runs, 'before.json'), join(runs, 'after.json')), /^PASS: trace VALID, correction VERIFIED/);
  // a before tree that already holds the fix: the same Case shows no issue there
  const fixed = make('fixed', 'export const add = (a, b) => a + b;\n');
  node('run', '--on', 'before', '--before', fixed, '--after', after, '--body-file', join(root, 'body.md'), '--runner', RUNNER, '--out', join(runs, 'fixed.json'));
  const noIssue = verdict(join(runs, 'fixed.json'), join(runs, 'after.json'));
  assert.match(noIssue, /^FAIL: /);
  assert.match(noIssue, /finding: the Case demo\/T1 is GREEN before/);
  // an after tree that still has the defect: the Case is still RED there
  const unfixed = make('unfixed', 'export const add = (a, b) => a - b;\n');
  for (const f of ['packages/kaal-demo/06-defects/D1-add.md', 'packages/kaal-demo/06-defects/add.test.mjs']) put(unfixed, f, readFileSync(join(after, f), 'utf8'));
  node('run', '--on', 'after', '--before', before, '--after', unfixed, '--body-file', join(root, 'body.md'), '--runner', RUNNER, '--out', join(runs, 'unfixed.json'));
  const still = node('--after', unfixed, '--body-file', join(root, 'body.md'), '--before-run', join(runs, 'before.json'), '--after-run', join(runs, 'unfixed.json'));
  assert.match(still, /^FAIL: /);
  assert.match(still, /finding: the Case demo\/T1 is still RED after/);
}
