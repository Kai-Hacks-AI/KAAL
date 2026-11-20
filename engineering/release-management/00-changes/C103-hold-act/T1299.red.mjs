// Case release/T1299 tests: release/F80
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
export const id = 'release/T1299';
export const tests = ['release/F80'];
export const title = 'hold Act holds only an ACT: with no retro that reflects a carried Change it passes whatever is red, with one the Cases of the carried Changes decide, a retro of an earlier collector holds nothing, the id and format of a retro are not read, and a carried Change that is not there cannot be judged';
const RETRO = (reflects, extra = '') => `---\n${extra}reflects: [${reflects.join(', ')}]\n---\n# a retro\n`;
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const { judgeHold, retrosOf, changeIdOf } = await load();
  const red = [{ id: 'x/T1', parked: true }];
  const green = [{ id: 'x/T2', parked: false }];
  const GREEN = { 'x/T2': 'GREEN' };
  // the pure judge, over facts
  const changes = [{ id: 'C1', applicable: red }, { id: 'C2', applicable: green }];
  assert.equal(judgeHold({ changes, retros: [], observed: {} }).verdict, 'PASS', 'no retro: nothing is held, whatever is red');
  assert.equal(judgeHold({ changes, retros: [{ reflects: ['C9'] }], observed: {} }).verdict, 'PASS', 'a retro of an earlier collector holds nothing');
  assert.equal(judgeHold({ changes, retros: [{ reflects: ['C2'] }], observed: GREEN }).verdict, 'FAIL', 'a retro reflecting any carried Change holds the whole collector while another Change is red');
  assert.match(judgeHold({ changes, retros: [{ reflects: ['C2'] }], observed: GREEN }).message, /finish your work first: x\/T1 of 2 applicable Cases/);
  assert.equal(judgeHold({ changes: [{ id: 'C2', applicable: green }], retros: [{ reflects: ['C2'] }], observed: GREEN }).verdict, 'PASS');
  assert.equal(judgeHold({ changes: [{ id: 'C2', applicable: green }], retros: [{ reflects: ['C2'] }], observed: { 'x/T2': 'RED' } }).verdict, 'FAIL');
  for (const bad of [undefined, null, 'C1', [{ id: 'C1' }], [{ id: '', applicable: [] }]]) assert.equal(judgeHold({ changes: bad, retros: [], observed: {} }).verdict, 'UNKNOWN', `carried Changes ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const bad of [undefined, null, 'RT1', [{ reflects: 'C1' }], [{ reflects: [1] }], [null]]) assert.equal(judgeHold({ changes, retros: bad, observed: {} }).verdict, 'UNKNOWN', `retros ${JSON.stringify(bad)} must be UNKNOWN`);
  assert.equal(changeIdOf('00-changes/C103-hold-act'), 'C103');
  assert.equal(changeIdOf('00-changes/nothing'), undefined);
  // the tree: the retros are found by what they reflect and nothing else of them is read
  const c = collector();
  const obs = join(c.root, 'observed.json');
  const cli = (observed, change = CHANGE) => {
    if (observed !== undefined) writeFileSync(obs, JSON.stringify(observed));
    const r = spawnSync(process.execPath, [SRC, '--root', c.root, '--changes', change, '--observed', obs], { encoding: 'utf8' });
    return { code: r.status, out: r.stdout };
  };
  try {
    c.put(`${CHANGE}/C999.md`, EL('x/C999', { implements: ['x/I1'] }));
    c.put(`${CHANGE}/interface.md`, drafts(EL('x/I1'), EL('x/F1', { serves: ['x/I1'] })));
    c.put(`${CHANGE}/T1.red.mjs`, CASE(1, ['x/F1']));
    assert.deepEqual(retrosOf(c.root), [], 'no folder, no retros');
    // a PLAN has landed, its Case is red, no retro: the PR must be able to land
    let r = cli({ 'x/T1': 'RED' });
    assert.deepEqual([r.code, r.out.startsWith('PASS')], [0, true], 'a PLAN without a retro must pass');
    rmSync(obs);
    assert.equal(cli(undefined).code, 0, 'no retro needs no observation');
    // a retro of an earlier collector stands in the tree and reflects other Changes
    c.put('02-learnings/retros/old.md', RETRO(['C998']));
    c.put('02-learnings/retros/readme.md', '# not a retro\n');
    c.put('02-learnings/retros/draft.md', '---\nid: x/RT0\n---\n# says nothing of what it reflects\n');
    assert.deepEqual(retrosOf(c.root), [{ reflects: ['C998'] }], 'only what declares reflects is a retro');
    assert.equal(cli({ 'x/T1': 'RED' }).code, 0, 'the retro of another Change holds nothing here');
    // the retro of this collector arrives while the work is not finished; its id and format are whatever kaal-retro chooses
    for (const [file, extra] of [['02-learnings/retros/RT7/retro.md', 'id: x/RT7\nformat: 4L\n'], ['02-learnings/retros/4L.3.md', 'id: 4L.3\n'], ['02-learnings/retros/anything.md', '']]) {
      c.put(file, RETRO(['C999'], extra));
      r = cli({ 'x/T1': 'RED' });
      assert.equal(r.code, 1, `a retro (${file}) with a red Case must be held`);
      assert.match(r.out, /finish your work first/);
      rmSync(obs);
      assert.equal(cli(undefined).code, 2, 'a retro needs an observation');
      c.rm(file);
    }
    // the work is finished
    c.put('02-learnings/retros/RT7/retro.md', RETRO(['C999']));
    c.mv(`${CHANGE}/T1.red.mjs`, `${CHANGE}/T1.test.mjs`);
    assert.equal(cli({ 'x/T1': 'GREEN' }).code, 0);
    // a carried Change that is not there, or a name that is not a Change, cannot be judged
    assert.equal(cli({ 'x/T1': 'GREEN' }, '00-changes/C000-nowhere').code, 2, 'a Change that is not there must not pass');
    assert.equal(cli({ 'x/T1': 'GREEN' }, '00-changes/nothing').code, 2);
  } finally { rmSync(c.root, { recursive: true, force: true }); }
}
