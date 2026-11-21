// Case release/T1308 tests: release/F86
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-verify-act.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C111-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1308';
export const tests = ['release/F86'];
export const title = 'node judge-verify-act.mjs --root <tree> --changes <dirs> --retro <scripts of kaal-retro> hands the retros of the tree to the finder and the form judgement of the real kaal-retro and exits 0 when each retro of the carried Changes is well formed or none reflects one, 1 for a malformed retro and for a file the finder refuses, 2 when it cannot tell, whatever the history of the tree says';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-verify-act.mjs is absent');
  const RETRO = join(repo, 'packages/kaal-retro/skills/kaal-retro/scripts');
  assert.ok(existsSync(join(RETRO, 'judge-retro.mjs')), 'kaal-retro is not in the tree');
  // a retro as kaal-retro writes it: the real first retro of kaal-retro, taken as the model of the form
  const model = readFileSync(join(repo, 'packages/kaal-retro/02-learnings/retros/RT1.md'), 'utf8');
  const retro = (n, reflects, edit = (x) => x) => edit(model.replace(/^id: .*$/m, `id: x/RT${n}`).replace(/^reflects: .*$/m, `reflects: [${reflects.join(', ')}]`));
  const root = mkdtempSync(join(tmpdir(), 'c111-'));
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), t); };
  const cli = (scripts = RETRO, ...dirs) => {
    const args = [SRC, '--root', root, '--changes', (dirs.length ? dirs : ['00-changes/C901-a', '00-changes/C902-b']).join(',')];
    if (scripts) args.push('--retro', scripts);
    const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
    return { code: r.status, out: r.stdout };
  };
  try {
    for (const [dir, rec] of [['00-changes/C901-a', 'C901'], ['00-changes/C902-b', 'C902']]) put(`${dir}/${rec}.md`, `---\nid: x/${rec}\nimplements: [x/I1]\n---\n# c\n`);
    const RT = (n) => `02-learnings/retros/RT${n}.md`;
    assert.equal(model.startsWith('---\nid: retro/RT1'), true, 'the model retro changed its shape: this Case is to be read again');
    // no retro: there is no ACT to verify
    assert.equal(cli().code, 0, 'no retro');
    // a well-formed retro of the real form, reflecting both
    put(RT(1), retro(1, ['x/C901', 'x/C902']));
    let r = cli();
    assert.deepEqual([r.code, r.out.trim()], [0, 'PASS: every retro of the carried Changes is well formed']);
    // the form is kaal-retro's: its rule names come through
    put(RT(1), retro(1, ['x/C901', 'x/C902'], (x) => x.replace(/^Account of:.*\n/m, '')));
    r = cli();
    assert.equal(r.code, 1);
    assert.match(r.out, /retro form: 02-learnings\/retros\/RT1\.md is not well formed \(.*account-of.*\)/);
    put(RT(1), retro(1, ['x/C901', 'x/C902'], (x) => x.replace('## Learned', '## Lacked Again')));
    assert.equal(cli().code, 1, 'sections out of order');
    // a retro of an earlier collector, malformed, is not judged again
    put(RT(1), retro(1, ['x/C901', 'x/C902']));
    put(RT(9), retro(9, ['x/C100'], (x) => x.replace(/^Account of:.*\n/m, '')));
    assert.equal(cli().code, 0, 'the retro of another collector is not judged here');
    // a format kaal-retro does not know is never well formed
    put(RT(1), retro(1, ['x/C901', 'x/C902'], (x) => x.replace('format: 4L', 'format: 5L')));
    r = cli();
    assert.equal(r.code, 2);
    assert.match(r.out, /UNKNOWN: cannot judge the form of: 02-learnings\/retros\/RT1\.md/);
    // a file that looks like a retro and that the finder refuses is revealed, whatever it reflects
    put(RT(1), retro(1, ['x/C901', 'x/C902']));
    put('02-learnings/retros/odd.md', '---\nid: not-an-id\nformat: 4L\nreflects: [x/C901]\n---\n# odd\n');
    r = cli();
    assert.equal(r.code, 1);
    assert.match(r.out, /odd\.md is not a retro the finder accepts \(id is not <capability>\/RT<n>\)/);
    rmSync(join(root, '02-learnings/retros/odd.md'));
    // it cannot tell
    assert.equal(cli(null).code, 2, 'the scripts of kaal-retro are not given');
    assert.equal(cli(join(root, 'nowhere')).code, 2, 'the scripts of kaal-retro are not there');
    assert.equal(cli(RETRO, '00-changes/C000-nowhere').code, 2, 'a Change that is not there must not pass');
    assert.equal(cli(RETRO, '00-changes/nothing').code, 2, 'a folder that is not a Change must not pass');
    // the history does not count
    put(RT(1), retro(1, ['x/C901', 'x/C902'], (x) => x.replace(/^Account of:.*\n/m, '')));
    const before = cli();
    const git = (...a) => execFileSync('git', ['-C', root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
    git('init', '-q', '-b', 'main'); git('add', '-A'); git('commit', '-q', '-m', 'ACT: the retro is fine');
    assert.deepEqual(cli(), before, 'a commit titled ACT must not make a retro well formed');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
