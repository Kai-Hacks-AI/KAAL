// Case release/T1303 tests: release/F85
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
export const id = 'release/T1303';
export const tests = ['release/F85'];
export const title = 'node judge-limit-act.mjs --changed <file> --roots <file> [--map <file>] reads the changed paths, the capability roots and the write map from files and exits 0 for no ACT or an ACT inside its folders, 1 naming the paths outside, 2 when it cannot tell, and gives the same answer when the capability stands elsewhere and whatever the title, the branch name or the history';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-limit-act.mjs is absent');
  const root = mkdtempSync(join(tmpdir(), 'c110-'));
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), typeof t === 'string' ? t : JSON.stringify(t)); };
  const cli = (...args) => { const r = spawnSync(process.execPath, [SRC, ...args], { encoding: 'utf8' }); return { code: r.status, out: r.stdout }; };
  const C = join(root, 'changed.json'), R = join(root, 'roots.json'), M = join(root, 'map.json');
  const run = (changed, roots = ['engineering/release-management', 'packages/kaal-retro', 'packages/kaal-engineering'], ...more) => { put('changed.json', changed); put('roots.json', roots); return cli('--changed', C, '--roots', R, ...more); };
  const RETRO = 'engineering/release-management/02-learnings/retros/RT1/retro.md';
  try {
    put('map.json', [{ route: 'act', folders: ['02-learnings/retros/'] }, { route: 'wire', folders: ['.github/'] }]);
    assert.equal(run(['engineering/release-management/05-src/a.mjs'], undefined, '--map', M).code, 0, 'no ACT');
    assert.equal(run([RETRO], undefined, '--map', M).code, 0, 'an ACT inside its folder');
    const r = run([RETRO, 'engineering/release-management/04-controls/CTL1/CTL1.md'], undefined, '--map', M);
    assert.equal(r.code, 1);
    assert.match(r.out, /04-controls\/CTL1\/CTL1\.md/);
    assert.doesNotMatch(r.out, /RT1/, 'a path inside is not named');
    // the default map is the one next to the judge, the real layout: the retro of kaal-retro, an older ACT of engineering, and that older ACT with a Case of its Change
    assert.equal(run(['packages/kaal-retro/02-learnings/retros/RT1.md']).code, 0, 'a retro of a package');
    assert.equal(run(['packages/kaal-engineering/00-changes/C27-operations-layout/act.md']).code, 0, 'a legacy ACT');
    assert.equal(run(['packages/kaal-engineering/00-changes/C27-operations-layout/act.md', 'packages/kaal-engineering/00-changes/C27-operations-layout/T1.test.mjs']).code, 1, 'a legacy ACT does not open its Change folder');
    // the same answer where the capabilities stand elsewhere: the folders moved, the roots handed in anew
    for (const [paths, code] of [[['02-learnings/retros/RT1.md'], 0], [['00-changes/C27/act.md'], 0], [['05-src/a.mjs'], 0], [['02-learnings/retros/RT1.md', '02-requirements/F1/F1.md'], 1]]) {
      const answers = [['packages', 'kaal-retro'], ['engineering', 'release-management'], ['somewhere/far/below', 'x'], ['', 'top']].map(([where, cap]) => {
        const base = where === '' ? cap : `${where}/${cap}`;
        const out = run(paths.map((p) => `${base}/${p}`), [base]);
        return [out.code, out.out.split(base).join('<root>')];
      });
      for (const a of answers) assert.deepEqual(a, answers[0], `the answer moved with the capability (${paths.join(', ')})`);
      assert.equal(answers[0][0], code);
    }
    // it cannot tell
    assert.equal(cli('--changed', join(root, 'missing.json'), '--roots', R).code, 2, 'a missing file must not pass');
    assert.equal(cli('--changed', C, '--roots', join(root, 'missing.json')).code, 2, 'missing roots must not pass');
    assert.equal(cli('--changed', C).code, 2, 'no roots given');
    put('changed.json', 'not json');
    assert.equal(cli('--changed', C, '--roots', R).code, 2, 'an unreadable file must not pass');
    assert.equal(run(['../x']).code, 2, 'a path that leaves the repository must not pass');
    assert.equal(run([RETRO], ['/abs']).code, 2, 'a root that is not relative must not pass');
    assert.equal(run([RETRO], undefined, '--map', join(root, 'nomap.json')).code, 2, 'a missing map must not pass');
    assert.equal(cli().code, 2, 'no arguments');
    // the history does not count: a branch and a commit that call themselves anything
    const before = run([RETRO, 'engineering/release-management/05-src/a.mjs']);
    const git = (...a) => execFileSync('git', ['-C', root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
    git('init', '-q', '-b', 'kaal/release/not-an-act'); git('add', '-A'); git('commit', '-q', '-m', 'ACT: only a retro');
    assert.deepEqual(run([RETRO, 'engineering/release-management/05-src/a.mjs']), before, 'a title or a branch name must not make it an ACT or not');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
