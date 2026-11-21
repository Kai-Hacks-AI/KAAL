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
export const title = 'release/A75 is the judge of the ACT route and addresses release/F85; the write map holds the relative row of the route act; judgeLimitAct says PASS for a pull request that is no ACT or an ACT inside its folders, FAIL naming the paths outside, UNKNOWN, never PASS, when it cannot be told, and gives the same verdict wherever the capability stands';
export async function run() {
  const real = join(RM, '03-architecture/A75-judge-limit-act/A75.md');
  assert.ok(existsSync(real), 'A75.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('A75.md')}\n`, 'A75.md differs from the draft');
  assert.ok(existsSync(SRC), 'judge-limit-act.mjs is absent');
  assert.ok(existsSync(MAP), 'write-map.json is absent');
  const shipped = JSON.parse(readFileSync(MAP, 'utf8'));
  const act = shipped.filter((r) => r.route === 'act');
  assert.equal(act.length, 1, 'one row for the route act');
  assert.deepEqual(act[0].folders, ['02-learnings/retros/'], 'the retros, relative to a capability root');
  assert.deepEqual(act[0].files, ['00-changes/*/act.md', 'plan/*/act.md'], 'the legacy places are files, never folders');
  const { judgeLimitAct, inFolder, isFile } = await import(pathToFileURL(SRC).href);
  const roots = ['engineering/release-management', 'packages/kaal-retro', 'packages/kaal-engineering'];
  const map = [{ route: 'act', folders: ['02-learnings/retros/', 'acts/'], files: ['00-changes/*/act.md'] }, { route: 'wire', folders: ['.github/'] }];
  const j = (changed, ...m) => judgeLimitAct({ changed, map: m.length > 0 ? m[0] : map, roots: m.length > 1 ? m[1] : roots });
  // inFolder, relative: a prefix of whole segments, '*' for exactly one
  assert.equal(inFolder('02-learnings/retros/RT1/retro.md', '02-learnings/retros/'), true);
  assert.equal(inFolder('a/b/x.md', 'a/*/'), true);
  assert.equal(inFolder('a/b/c/x.md', 'a/*/'), true, 'deeper below the one segment');
  assert.equal(inFolder('a/x.md', 'a/*/'), false, 'the * is a segment, not nothing');
  assert.equal(inFolder('02-learnings/retros', '02-learnings/retros/'), false, 'the folder itself is not a file in it');
  assert.equal(inFolder('02-learnings/retros-old/x.md', '02-learnings/retros/'), false, 'whole segments only');
  // isFile: an exact path, '*' for exactly one segment
  assert.equal(isFile('00-changes/C27-operations-layout/act.md', '00-changes/*/act.md'), true);
  assert.equal(isFile('00-changes/C27-operations-layout/T1.test.mjs', '00-changes/*/act.md'), false);
  assert.equal(isFile('00-changes/C27/x/act.md', '00-changes/*/act.md'), false, '* is exactly one segment');
  assert.equal(isFile('00-changes/C27-operations-layout/act.md/extra', '00-changes/*/act.md'), false, 'an exact path, not a prefix');
  assert.equal(isFile('00-changes/C27-operations-layout/act.md.bak', '00-changes/*/act.md'), false);
  // PASS: no ACT, or an ACT inside its folders
  assert.equal(j([]).verdict, 'PASS', 'a pull request that changes nothing is no ACT');
  assert.equal(j(['engineering/release-management/05-src/x.mjs', 'README.md']).verdict, 'PASS', 'no ACT folder touched: not an ACT');
  assert.equal(j(['.github/workflows/x.yml']).verdict, 'PASS', 'the folders of another route are not read');
  assert.equal(j(['engineering/release-management/02-learnings/retros/RT1/retro.md', 'packages/kaal-retro/acts/a.md']).verdict, 'PASS', 'an ACT inside its folders');
  // the real layout: the retro of kaal-retro is in a package, the older ACT of engineering is a file of its Change folder
  assert.equal(j(['packages/kaal-retro/02-learnings/retros/RT1.md']).verdict, 'PASS');
  assert.equal(j(['packages/kaal-engineering/00-changes/C27-operations-layout/act.md']).verdict, 'PASS', 'a legacy ACT is recognised');
  let f = j(['packages/kaal-engineering/00-changes/C27-operations-layout/act.md', 'packages/kaal-engineering/00-changes/C27-operations-layout/T1.test.mjs']);
  assert.equal(f.verdict, 'FAIL', 'recognising a legacy ACT does not open the rest of its Change folder');
  assert.deepEqual(f.outside, ['packages/kaal-engineering/00-changes/C27-operations-layout/T1.test.mjs']);
  assert.equal(j(['.github/PULL_REQUEST_TEMPLATE/act.md']).verdict, 'PASS', 'a template named act.md is not an ACT');
  // FAIL: an ACT that writes outside, and a path in no capability at all
  f = j(['engineering/release-management/02-learnings/retros/RT1/retro.md', 'engineering/release-management/02-requirements/F1/F1.md', 'engineering/x/05-src/a.mjs']);
  assert.equal(f.verdict, 'FAIL');
  assert.deepEqual(f.outside, ['engineering/release-management/02-requirements/F1/F1.md', 'engineering/x/05-src/a.mjs'], 'a path under no capability root is outside');
  assert.ok(f.message.includes('02-requirements/F1/F1.md'), 'the path outside is not named');
  f = j(['packages/kaal-retro/02-learnings/retros/RT1.md', '02-learnings/retros/stray.md']);
  assert.equal(f.verdict, 'FAIL', 'a retro folder under no capability root is not a retro folder');
  assert.deepEqual(f.outside, ['02-learnings/retros/stray.md']);
  f = j(['engineering/release-management/02-learnings/retros/RT1/retro.md', '.github/workflows/x.yml']);
  assert.equal(f.verdict, 'FAIL', 'the folders of another route are not the ACT\'s');
  assert.equal(j(['packages/kaal-retro/02-learnings/retros/RT1.md', 'x.md'], [{ route: 'act', folders: ['acts/'] }]).verdict, 'PASS', 'the row of the map is what is read');
  // the longest capability root is the one that counts
  const nested = ['packages', 'packages/kaal-retro'];
  assert.equal(j(['packages/kaal-retro/02-learnings/retros/RT1.md'], map, nested).verdict, 'PASS', 'relative to the longest root');
  assert.equal(j(['packages/kaal-retro/02-learnings/retros/RT1.md', 'packages/other/x.mjs'], map, nested).verdict, 'FAIL');
  // the same verdict wherever the capabilities stand: every scenario under another set of roots, the paths moved with them
  const scenarios = [
    ['retro only', [['kaal-retro', '02-learnings/retros/RT1.md']], 'PASS'],
    ['legacy ACT only', [['kaal-engineering', '00-changes/C27-operations-layout/act.md']], 'PASS'],
    ['not an ACT', [['kaal-retro', '05-src/a.mjs']], 'PASS'],
    ['retro with a Requirement', [['kaal-retro', '02-learnings/retros/RT1.md'], ['kaal-retro', '02-requirements/F1/F1.md']], 'FAIL'],
    ['legacy ACT with its Case', [['kaal-engineering', '00-changes/C27-operations-layout/act.md'], ['kaal-engineering', '00-changes/C27-operations-layout/T1.test.mjs']], 'FAIL'],
  ];
  const placements = [
    (name) => `packages/${name}`,
    (name) => `engineering/${name}`,
    (name) => `elsewhere/much/deeper/${name}`,
    (name) => `${name}`,
  ];
  for (const [what, items, want] of scenarios) {
    const seen = [];
    for (const place of placements) {
      const names = [...new Set(items.map(([cap]) => cap))];
      const r = judgeLimitAct({ changed: items.map(([cap, rel]) => `${place(cap)}/${rel}`), map: shipped, roots: names.map(place) });
      assert.equal(r.verdict, want, `${what}: moved to ${place('cap')}`);
      seen.push((r.outside ?? []).map((p) => p.replace(place(''), '')));
    }
    for (const s of seen) assert.deepEqual(s, seen[0], `${what}: the paths named outside do not depend on where the capability stands`);
  }
  // UNKNOWN: it cannot be told
  for (const bad of [undefined, null, 'a', {}, [''], [5], [null], ['/etc/passwd'], ['a/../b'], ['./a']]) assert.equal(j(bad).verdict, 'UNKNOWN', `changed ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const bad of [undefined, null, 'a', {}, [null], [{}], [{ route: 'act' }], [{ route: 'act', folders: [] }], [{ route: 'act', folders: ['no-slash'] }], [{ route: 'act', files: ['dir/'] }], [{ route: 'act', files: [] }], [{ route: 'act', files: ['/abs'] }], [{ route: 'act', folders: 'a/' }], [{ route: 'act', folders: ['/abs/'] }], [{ route: 'act', folders: ['a/../'] }], [{ route: '', folders: ['a/'] }], [{ route: 'wire', folders: ['a/'] }], [map[0], map[0]]]) assert.equal(j(['x'], bad).verdict, 'UNKNOWN', `map ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const bad of [undefined, null, 'a', {}, [''], [5], [null], ['/abs'], ['a/../b'], ['./a']]) assert.equal(j(['x'], map, bad).verdict, 'UNKNOWN', `roots ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const nothing of [undefined, null, 'x']) assert.equal(judgeLimitAct(nothing).verdict, 'UNKNOWN');
}
