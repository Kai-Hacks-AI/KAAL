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
export const title = 'hold Act holds only an ACT: a Change folder without its ACT passes whatever is red, with one it is judged by its Cases, and whether it holds one cannot be told for a folder that is not there';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const { judgeAct, actOf } = await load();
  const applicable = [{ id: 'x/T1', parked: true }, { id: 'x/T2', parked: false }];
  // the pure judge
  assert.equal(judgeAct({ applicable, observed: { 'x/T2': 'RED' }, acted: false }).verdict, 'PASS', 'no ACT is proposed: nothing is held, whatever is red');
  assert.equal(judgeAct({ applicable: undefined, observed: undefined, acted: false }).verdict, 'PASS', 'no ACT is proposed: nothing is needed to say so');
  assert.equal(judgeAct({ applicable, observed: { 'x/T2': 'RED' }, acted: true }).verdict, 'FAIL', 'the ACT is held while a Case is red');
  for (const acted of [undefined, null, 'true', 1, 0]) assert.equal(judgeAct({ applicable, observed: { 'x/T1': 'GREEN', 'x/T2': 'GREEN' }, acted }).verdict, 'UNKNOWN', `acted ${JSON.stringify(acted)} must be UNKNOWN`);
  // the tree: the answer follows the ACT beside the Change folder and nothing else
  const c = collector();
  const obs = join(c.root, 'observed.json');
  const cli = (observed, change = CHANGE) => {
    if (observed !== undefined) writeFileSync(obs, JSON.stringify(observed));
    const r = spawnSync(process.execPath, [SRC, '--root', c.root, '--change', change, '--observed', obs], { encoding: 'utf8' });
    return { code: r.status, out: r.stdout };
  };
  try {
    c.put(`${CHANGE}/C999.md`, EL('x/C999', { implements: ['x/I1'] }));
    c.put(`${CHANGE}/interface.md`, drafts(EL('x/I1'), EL('x/F1', { serves: ['x/I1'] })));
    c.put(`${CHANGE}/T1.red.mjs`, CASE(1, ['x/F1']));
    assert.equal(actOf(c.root, CHANGE), false);
    assert.equal(actOf(c.root, '00-changes/C000-nowhere'), undefined, 'a folder that is not there holds neither an ACT nor none');
    // a PLAN has landed, its Case is red, no ACT: the PR must be able to land
    let r = cli({ 'x/T1': 'RED' });
    assert.deepEqual([r.code, r.out.startsWith('PASS')], [0, true], 'a PLAN without an ACT must pass');
    rmSync(obs);
    assert.equal(cli(undefined).code, 0, 'no ACT needs no observation');
    // an ACT arrives while the work is not finished
    c.put(`${CHANGE}.act.md`, '# the ACT\n');
    assert.equal(actOf(c.root, CHANGE), true);
    r = cli({ 'x/T1': 'RED' });
    assert.equal(r.code, 1, 'an ACT with a red Case must be held');
    assert.match(r.out, /finish your work first/);
    rmSync(obs);
    assert.equal(cli(undefined).code, 2, 'an ACT needs an observation');
    // the work is finished
    c.mv(`${CHANGE}/T1.red.mjs`, `${CHANGE}/T1.test.mjs`);
    assert.equal(cli({ 'x/T1': 'GREEN' }).code, 0);
    // the ACT of another Change is not this Change's ACT
    c.rm(`${CHANGE}.act.md`);
    c.mv(`${CHANGE}/T1.test.mjs`, `${CHANGE}/T1.red.mjs`);
    c.put('00-changes/C998-other.act.md', '# the ACT of another Change\n');
    assert.equal(cli({ 'x/T1': 'RED' }).code, 0, 'the ACT of another Change holds nothing here');
    assert.equal(cli({ 'x/T1': 'RED' }, '00-changes/C000-nowhere').code, 2, 'a Change that is not there must not pass');
  } finally { rmSync(c.root, { recursive: true, force: true }); }
}
