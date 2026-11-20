// Case release/T1302 tests: release/A75, release/F85
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-limit-act.mjs');
const MAP = join(RM, '05-src/phase/write-map.json');
const draft = (name) => readFileSync(join(RM, '00-changes/C110-limit-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1302';
export const tests = ['release/A75', 'release/F85'];
export const title = 'release/A75 is the judge of the ACT route and addresses release/F85; the write map holds the row of the route act; judgeLimitAct says PASS for a pull request that is no ACT or an ACT inside its folders, FAIL naming the paths outside, and UNKNOWN, never PASS, when it cannot be told';
export async function run() {
  const real = join(RM, '03-architecture/A75-judge-limit-act/A75.md');
  assert.ok(existsSync(real), 'A75.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('A75.md')}\n`, 'A75.md differs from the draft');
  assert.ok(existsSync(SRC), 'judge-limit-act.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-limit-act.mjs')}\n`, 'judge-limit-act.mjs differs from the draft');
  assert.ok(existsSync(MAP), 'write-map.json is absent');
  assert.equal(readFileSync(MAP, 'utf8'), `${draft('write-map.json')}\n`, 'write-map.json differs from the draft');
  const shipped = JSON.parse(readFileSync(MAP, 'utf8'));
  const act = shipped.filter((r) => r.route === 'act');
  assert.equal(act.length, 1, 'one row for the route act');
  assert.deepEqual(act[0].folders, ['engineering/*/02-learnings/retros/', 'packages/*/02-learnings/retros/'], 'the retros of both trees');
  assert.deepEqual(act[0].files, ['engineering/*/00-changes/*/act.md', 'packages/*/00-changes/*/act.md', 'packages/*/plan/*/act.md'], 'the legacy places are files, never folders');
  const { judgeLimitAct, inFolder, isFile } = await import(pathToFileURL(SRC).href);
  const map = [{ route: 'act', folders: ['engineering/*/02-learnings/retros/', 'docs/acts/'], files: ['packages/*/00-changes/*/act.md'] }, { route: 'wire', folders: ['.github/'] }];
  const j = (changed, ...m) => judgeLimitAct({ changed, map: m.length ? m[0] : map });
  // inFolder: a prefix of whole segments, '*' for exactly one
  assert.equal(inFolder('engineering/release-management/02-learnings/retros/RT1/retro.md', 'engineering/*/02-learnings/retros/'), true);
  assert.equal(inFolder('engineering/a/b/02-learnings/retros/x.md', 'engineering/*/02-learnings/retros/'), false, '* is exactly one segment');
  assert.equal(inFolder('engineering/release-management/02-learnings/retros', 'engineering/*/02-learnings/retros/'), false, 'the folder itself is not a file in it');
  assert.equal(inFolder('engineering/release-management/02-learnings/retros-old/x.md', 'engineering/*/02-learnings/retros/'), false, 'whole segments only');
  // isFile: an exact path, '*' for exactly one segment
  assert.equal(isFile('packages/kaal-engineering/00-changes/C27-operations-layout/act.md', 'packages/*/00-changes/*/act.md'), true);
  assert.equal(isFile('packages/kaal-engineering/00-changes/C27-operations-layout/T1.test.mjs', 'packages/*/00-changes/*/act.md'), false);
  assert.equal(isFile('packages/kaal-engineering/00-changes/C27/x/act.md', 'packages/*/00-changes/*/act.md'), false, '* is exactly one segment');
  assert.equal(isFile('packages/kaal-engineering/00-changes/C27-operations-layout/act.md.bak', 'packages/*/00-changes/*/act.md'), false);
  // PASS: no ACT, or an ACT inside its folders
  assert.equal(j([]).verdict, 'PASS', 'a pull request that changes nothing is no ACT');
  assert.equal(j(['engineering/release-management/05-src/x.mjs', 'README.md']).verdict, 'PASS', 'no ACT folder touched: not an ACT');
  assert.equal(j(['.github/workflows/x.yml']).verdict, 'PASS', 'the folders of another route are not read');
  assert.equal(j(['engineering/release-management/02-learnings/retros/RT1/retro.md', 'docs/acts/a.md']).verdict, 'PASS', 'an ACT inside its folders');
  // the real layout: the retro of kaal-retro is in packages, the older ACT of engineering is a file of its Change folder
  assert.equal(j(['packages/kaal-retro/02-learnings/retros/RT1.md'], [{ route: 'act', folders: ['engineering/*/02-learnings/retros/', 'packages/*/02-learnings/retros/'] }]).verdict, 'PASS');
  assert.equal(j(['packages/kaal-engineering/00-changes/C27-operations-layout/act.md']).verdict, 'PASS', 'a legacy ACT is recognised');
  let f = j(['packages/kaal-engineering/00-changes/C27-operations-layout/act.md', 'packages/kaal-engineering/00-changes/C27-operations-layout/T1.test.mjs']);
  assert.equal(f.verdict, 'FAIL', 'recognising a legacy ACT does not open the rest of its Change folder');
  assert.deepEqual(f.outside, ['packages/kaal-engineering/00-changes/C27-operations-layout/T1.test.mjs']);
  assert.equal(j(['.github/PULL_REQUEST_TEMPLATE/act.md']).verdict, 'PASS', 'a template named act.md is not an ACT');
  // FAIL: an ACT that writes outside
  f = j(['engineering/release-management/02-learnings/retros/RT1/retro.md', 'engineering/release-management/02-requirements/F1/F1.md', 'engineering/x/05-src/a.mjs']);
  assert.equal(f.verdict, 'FAIL');
  assert.deepEqual(f.outside, ['engineering/release-management/02-requirements/F1/F1.md', 'engineering/x/05-src/a.mjs']);
  assert.ok(f.message.includes('02-requirements/F1/F1.md'), 'the path outside is not named');
  f = j(['engineering/release-management/02-learnings/retros/RT1/retro.md', '.github/workflows/x.yml']);
  assert.equal(f.verdict, 'FAIL', 'the folders of another route are not the ACT\'s');
  // the row of the map is what is read: with the retros removed from it, the same pull request is no ACT
  assert.equal(j(['engineering/release-management/02-learnings/retros/RT1/retro.md', 'x.md'], [{ route: 'act', folders: ['docs/acts/'] }]).verdict, 'PASS');
  // UNKNOWN: it cannot be told
  for (const bad of [undefined, null, 'a', {}, [''], [5], [null], ['/etc/passwd'], ['a/../b'], ['./a']]) assert.equal(j(bad).verdict, 'UNKNOWN', `changed ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const bad of [undefined, null, 'a', {}, [null], [{}], [{ route: 'act' }], [{ route: 'act', folders: [] }], [{ route: 'act', folders: ['no-slash'] }], [{ route: 'act', files: ['dir/'] }], [{ route: 'act', files: [] }], [{ route: 'act', files: ['/abs'] }], [{ route: 'act', folders: 'a/' }], [{ route: 'act', folders: ['/abs/'] }], [{ route: 'act', folders: ['a/../'] }], [{ route: '', folders: ['a/'] }], [{ route: 'wire', folders: ['a/'] }], [map[0], map[0]]]) assert.equal(j(['x'], bad).verdict, 'UNKNOWN', `map ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const nothing of [undefined, null, 'x']) assert.equal(judgeLimitAct(nothing).verdict, 'UNKNOWN');
}
