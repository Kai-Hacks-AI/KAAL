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
export const title = 'node judge-limit-act.mjs --changed <file> [--map <file>] reads the changed paths and the write map from files and exits 0 for no ACT or an ACT inside its folders, 1 naming the paths outside, 2 when it cannot tell, and gives the same answer whatever the title, the branch name or the history';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-limit-act.mjs is absent');
  const root = mkdtempSync(join(tmpdir(), 'c110-'));
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), typeof t === 'string' ? t : JSON.stringify(t)); };
  const cli = (...args) => { const r = spawnSync(process.execPath, [SRC, ...args], { encoding: 'utf8' }); return { code: r.status, out: r.stdout }; };
  const RETRO = 'engineering/release-management/02-learnings/retros/RT1/retro.md';
  try {
    put('map.json', [{ route: 'act', folders: ['engineering/*/02-learnings/retros/'] }, { route: 'wire', folders: ['.github/'] }]);
    const run = (changed) => { put('changed.json', changed); return cli('--changed', join(root, 'changed.json'), '--map', join(root, 'map.json')); };
    assert.equal(run(['engineering/release-management/05-src/a.mjs']).code, 0, 'no ACT');
    assert.equal(run([RETRO]).code, 0, 'an ACT inside its folder');
    const r = run([RETRO, 'engineering/release-management/04-controls/CTL1/CTL1.md']);
    assert.equal(r.code, 1);
    assert.match(r.out, /04-controls\/CTL1\/CTL1\.md/);
    assert.doesNotMatch(r.out, /RT1/, 'a path inside is not named');
    // the default map is the one next to the judge: with it, the retros are the ACT's folder
    put('changed.json', [RETRO, 'engineering/release-management/01-intent/I1/I1.md']);
    assert.equal(cli('--changed', join(root, 'changed.json')).code, 1, 'the default write map is read');
    // the real layout, with the default map: the retro of kaal-retro, an older ACT of engineering, and that older ACT with a Case of its Change
    put('changed.json', ['packages/kaal-retro/02-learnings/retros/RT1.md']);
    assert.equal(cli('--changed', join(root, 'changed.json')).code, 0, 'a retro of a package');
    put('changed.json', ['packages/kaal-engineering/00-changes/C27-operations-layout/act.md']);
    assert.equal(cli('--changed', join(root, 'changed.json')).code, 0, 'a legacy ACT');
    put('changed.json', ['packages/kaal-engineering/00-changes/C27-operations-layout/act.md', 'packages/kaal-engineering/00-changes/C27-operations-layout/T1.test.mjs']);
    assert.equal(cli('--changed', join(root, 'changed.json')).code, 1, 'a legacy ACT does not open its Change folder');
    // it cannot tell
    assert.equal(cli('--changed', join(root, 'missing.json'), '--map', join(root, 'map.json')).code, 2, 'a missing file must not pass');
    put('changed.json', 'not json');
    assert.equal(cli('--changed', join(root, 'changed.json'), '--map', join(root, 'map.json')).code, 2, 'an unreadable file must not pass');
    put('changed.json', ['../x']);
    assert.equal(cli('--changed', join(root, 'changed.json'), '--map', join(root, 'map.json')).code, 2, 'a path that leaves the repository must not pass');
    put('changed.json', [RETRO]);
    assert.equal(cli('--changed', join(root, 'changed.json'), '--map', join(root, 'nomap.json')).code, 2, 'a missing map must not pass');
    assert.equal(cli().code, 2, 'no arguments');
    // the history does not count: a branch and a commit that call themselves anything
    put('changed.json', [RETRO, 'engineering/release-management/05-src/a.mjs']);
    const before = run([RETRO, 'engineering/release-management/05-src/a.mjs']);
    const git = (...a) => execFileSync('git', ['-C', root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
    git('init', '-q', '-b', 'kaal/release/not-an-act'); git('add', '-A'); git('commit', '-q', '-m', 'ACT: only a retro');
    assert.deepEqual(run([RETRO, 'engineering/release-management/05-src/a.mjs']), before, 'a title or a branch name must not make it an ACT or not');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
