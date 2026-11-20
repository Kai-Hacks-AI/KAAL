// Case release/T1264 tests: release/F80
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-act.mjs');
const load = () => import(pathToFileURL(SRC).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C103-hold-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];

// A collector as it is found: a folder of files. No Git is involved; the Cases make its content grow by hand, as PLANs and DOs would.
const CHANGE = '00-changes/C999-demo';
const CASE = (n, tests, v = 'v1') => `export const id = 'x/T${n}';\nexport const tests = [${tests.map((t) => `'${t}'`).join(', ')}];\nexport const title = 't';\nexport async function run() { /* ${v} */ }\n`;
const EL = (id, edges = {}) => `---\nid: ${id}\n${Object.entries(edges).map(([k, v]) => `${k}: [${v.join(', ')}]`).join('\n')}\n---\n# ${id}\n`;
const FENCE = '`````';
const drafts = (...els) => `# interface\n\n${els.map((e, i) => `## Draft of E${i}\n\n${FENCE}\n${e}${FENCE}\n`).join('\n')}`;
function collector() {
  const root = mkdtempSync(join(tmpdir(), 'c103-'));
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), t); };
  const rm = (p) => rmSync(join(root, p));
  const mv = (a, b) => { mkdirSync(dirname(join(root, b)), { recursive: true }); renameSync(join(root, a), join(root, b)); };
  return { root, put, rm, mv };
}
export const id = 'release/T1266';
export const tests = ['release/F80'];
export const title = 'the command line of release/F80 exits 0 only when every applicable Case of the tree is not parked and observed GREEN, 1 naming them while any is parked red or observed RED, 2 when one is not observed, none applies or the input is unusable, and gives the same answer whatever the history of the folder';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const c = collector();
  const obs = join(c.root, 'observed.json');
  const cli = (observed, change = CHANGE) => {
    if (observed !== undefined) writeFileSync(obs, JSON.stringify(observed));
    const r = spawnSync(process.execPath, [SRC, '--root', c.root, '--changes', change, '--observed', obs], { encoding: 'utf8' });
    return { code: r.status, out: r.stdout };
  };
  try {
    c.put(`${CHANGE}/C999.md`, EL('x/C999', { implements: ['x/I1'] }));
    c.put('02-learnings/retros/RT1/retro.md', '---\nid: x/RT1\nformat: 4L\nreflects: [C999]\n---\n# the retro\n');
    c.put(`${CHANGE}/interface.md`, drafts(EL('x/I1'), EL('x/F1', { serves: ['x/I1'] }), EL('x/A1', { addresses: ['x/F1'] })));
    c.put(`${CHANGE}/T1.red.mjs`, CASE(1, ['x/F1']));
    c.put('03-architecture/A1-x/T3.red.mjs', CASE(3, ['x/A1']));
    const green = { 'x/T1': 'GREEN', 'x/T3': 'GREEN' };
    // The PLANs have arrived and no DO yet: the work is not finished, loudly, with the counts.
    let r = cli(green);
    assert.equal(r.code, 1);
    assert.match(r.out, /FAIL: finish your work first: x\/T1, x\/T3 of 2 applicable Cases are not really green \(red 2, green 0, unknown 0\)/);
    // One DO later.
    c.mv(`${CHANGE}/T1.red.mjs`, `${CHANGE}/T1.test.mjs`);
    r = cli(green);
    assert.equal(r.code, 1);
    assert.match(r.out, /x\/T3/);
    assert.doesNotMatch(r.out, /x\/T1[^0-9]/);
    c.mv('03-architecture/A1-x/T3.red.mjs', '03-architecture/A1-x/T3.test.mjs');
    r = cli(green);
    assert.deepEqual([r.code, r.out.trim()], [0, 'PASS (red 0, green 2, unknown 0)']);
    // Each way of not being really green is refused or never passes.
    assert.equal(cli({ ...green, 'x/T3': 'RED' }).code, 1, 'an observed RED must fail');
    assert.match(cli({ ...green, 'x/T3': 'RED' }).out, /x\/T3/);
    assert.equal(cli({ 'x/T1': 'GREEN' }).code, 2, 'an unobserved Case must not pass');
    assert.equal(cli({ ...green, 'x/T3': 'UNKNOWN' }).code, 2);
    assert.equal(cli({ 'x/T1': 'RED' }).code, 1, 'FAIL outranks UNKNOWN');
    rmSync(obs);
    assert.equal(cli(undefined).code, 2, 'a missing observation must not pass');
    writeFileSync(obs, 'not json');
    assert.equal(cli(undefined).code, 2, 'an unreadable observation must not pass');
    assert.equal(cli(green, '00-changes/C000-nowhere').code, 2, 'an unknown Change must not pass');
    // The same folder gives the same answer under a history that lies: commits titled PLAN and DO that say the opposite of the content.
    const before = cli(green);
    const git = (...a) => execFileSync('git', ['-C', c.root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
    git('init', '-q', '-b', 'main'); git('add', '-A'); git('commit', '-q', '-m', 'PLAN: nothing is applicable here');
    c.put('note.txt', 'x'); git('add', '-A'); git('commit', '-q', '-m', 'DO: finished everything');
    assert.deepEqual(cli(green), before, 'the answer must not depend on the history');
    c.mv(`${CHANGE}/T1.test.mjs`, `${CHANGE}/T1.red.mjs`); git('add', '-A'); git('commit', '-q', '-m', 'ACT: everything is green');
    assert.equal(cli(green).code, 1, 'a commit titled ACT must not make the content green');
  } finally { rmSync(c.root, { recursive: true, force: true }); }
}
