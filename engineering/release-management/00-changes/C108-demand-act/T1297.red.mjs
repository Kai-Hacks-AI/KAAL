// Case release/T1297 tests: release/F84
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
const SRC = join(RM, '05-src/phase/judge-demand-act.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C108-demand-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1297';
export const tests = ['release/F84'];
export const title = 'node judge-demand-act.mjs --root <tree> --changes <dirs> --observed <file> reads the act.md and the Cases of each carried Change from the tree and exits 0, 1 for a finished Change without its ACT, 2 when it cannot tell, whatever the history of the tree says';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-demand-act.mjs is absent');
  const root = mkdtempSync(join(tmpdir(), 'c108-'));
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), t); };
  const mv = (a, b) => { mkdirSync(dirname(join(root, b)), { recursive: true }); renameSync(join(root, a), join(root, b)); };
  const obs = join(root, 'observed.json');
  const cli = (observed, ...dirs) => {
    if (observed !== undefined) writeFileSync(obs, JSON.stringify(observed));
    const r = spawnSync(process.execPath, [SRC, '--root', root, '--changes', dirs.join(','), '--observed', obs], { encoding: 'utf8' });
    return { code: r.status, out: r.stdout };
  };
  try {
    const A = '00-changes/C901-a', B = '00-changes/C902-b';
    for (const [dir, n] of [[A, 1], [B, 2]]) {
      put(`${dir}/${dir.split('/')[1].slice(0, 4)}.md`, `---\nid: x/${dir.split('/')[1].slice(0, 4)}\nimplements: [x/I${n}]\n---\n# c\n`);
      put(`${dir}/interface.md`, `# i\n\n## Draft of E\n\n\`\`\`\`\`\n---\nid: x/I${n}\n---\n# i\n\`\`\`\`\`\n`);
      put(`${dir}/T${n}.red.mjs`, `export const id = 'x/T${n}';\nexport const tests = ['x/I${n}'];\nexport const title = 't';\nexport async function run() {}\n`);
    }
    const green = { 'x/T1': 'GREEN', 'x/T2': 'GREEN' };
    // PLANs landed: red, nothing is due
    assert.deepEqual([cli(green, A, B).code], [0], 'parked Cases owe no ACT yet');
    // the DOs landed in A: finished, no ACT: due
    mv(`${A}/T1.red.mjs`, `${A}/T1.test.mjs`);
    let r = cli(green, A, B);
    assert.equal(r.code, 1);
    assert.match(r.out, /C901-a/);
    assert.doesNotMatch(r.out, /C902-b/, 'a Change that is not finished is not named');
    // the ACT arrives in A
    put(`${A}/act.md`, '# the ACT\n');
    assert.equal(cli(green, A, B).code, 0);
    // B finishes without an ACT
    mv(`${B}/T2.red.mjs`, `${B}/T2.test.mjs`);
    r = cli(green, A, B);
    assert.equal(r.code, 1);
    assert.match(r.out, /C902-b/);
    // it cannot tell
    assert.equal(cli({ 'x/T1': 'GREEN' }, A, B).code, 2, 'an unobserved Case of a Change without its ACT');
    assert.equal(cli(green, A, '00-changes/C000-nowhere').code, 2, 'a Change that is not there must not pass');
    rmSync(obs);
    assert.equal(cli(undefined, A).code, 0, 'a Change with its ACT needs no observation');
    assert.equal(cli(undefined, A, B).code, 2, 'a missing observation must not pass');
    writeFileSync(obs, 'not json');
    assert.equal(cli(undefined, A, B).code, 2, 'an unreadable observation must not pass');
    // the history does not count
    writeFileSync(obs, JSON.stringify(green));
    const before = cli(undefined, A, B);
    const git = (...a) => execFileSync('git', ['-C', root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
    git('init', '-q', '-b', 'main'); git('add', '-A'); git('commit', '-q', '-m', 'ACT: everything is closed');
    assert.deepEqual(cli(undefined, A, B), before, 'a commit titled ACT must not close a Change');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
