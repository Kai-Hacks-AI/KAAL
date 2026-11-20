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
export const id = 'release/T1265';
export const tests = ['release/A71'];
export const title = 'release/A71 finds the applicable Cases from the content of a collector as PLANs and DOs arrive in it: justified Cases accumulate, are amended and retired, DOs unpark them, and nothing is read from Git';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const t = readFileSync(join(RM, '03-architecture/A71-hold-act-from-the-tree/A71.md'), 'utf8');
  assert.equal(t, `${draft('A71.md')}\n`, 'A71.md differs from the draft');
  const { applicableCases, elementsOf } = await load();
  const c = collector();
  const seen = () => applicableCases(c.root, CHANGE).map((x) => `${x.id.split('/')[1]}${x.parked ? '*' : ''}`).join(' ');
  try {
    // PLAN 1: the Change, its justification as drafts (a Requirement serving the Intent) and two RED Cases; another Intent's Case is not its business.
    c.put(`${CHANGE}/C999.md`, EL('x/C999', { implements: ['x/I1'] }));
    c.put(`${CHANGE}/interface.md`, drafts(EL('x/I1'), EL('x/F1', { serves: ['x/I1'] })));
    c.put(`${CHANGE}/T1.red.mjs`, CASE(1, ['x/F1']));
    c.put(`${CHANGE}/T2.red.mjs`, CASE(2, ['x/F1']));
    c.put('01-intent/I9-other/T50.test.mjs', CASE(50, ['x/I9']));
    assert.equal(seen(), 'T1* T2*');
    // PLAN 2 arrives in the same collector: an Architecture draft addressing the Requirement, and a Case beside it that tests the Architecture.
    // It is applicable only through the relationships; an unrelated Requirement with its Case stays out.
    c.put(`${CHANGE}/interface.md`, drafts(EL('x/I1'), EL('x/F1', { serves: ['x/I1'] }), EL('x/A1', { addresses: ['x/F1'] }), EL('x/F9', { serves: ['x/I9'] })));
    c.put('03-architecture/A1-x/T3.red.mjs', CASE(3, ['x/A1']));
    c.put('02-requirements/F9-y/T61.red.mjs', CASE(61, ['x/F9']));
    assert.equal(seen(), 'T1* T2* T3*', 'a second PLAN must widen the applicable set through the relationships');
    // DO 1 turns two of them GREEN: the same Cases, renamed, wherever they stand.
    c.mv(`${CHANGE}/T1.red.mjs`, `${CHANGE}/T1.test.mjs`);
    c.mv('03-architecture/A1-x/T3.red.mjs', '03-architecture/A1-x/T3.test.mjs');
    assert.equal(seen(), 'T1 T2* T3');
    // PLAN 3 amends: T2 is retired, T4 is added in a test folder for the Intent itself, and the Architecture draft is placed as a real element (it wins over its draft).
    c.rm(`${CHANGE}/T2.red.mjs`);
    c.put('01-intent/I1-x/T4.red.mjs', CASE(4, ['x/I1']));
    c.put('03-architecture/A1-x/A1.md', EL('x/A1', { addresses: ['x/F1'] }));
    assert.equal(seen(), 'T1 T3 T4*', 'a retired Case must stop being required and an added one start');
    assert.equal(elementsOf(c.root, CHANGE).get('x/A1').addresses[0], 'x/F1');
    // A copy of a Case left parked beside its GREEN one keeps it parked: it is not really green.
    c.put(`${CHANGE}/copy/T1.red.mjs`, CASE(1, ['x/F1']));
    assert.equal(seen(), 'T1* T3 T4*');
    c.rm(`${CHANGE}/copy/T1.red.mjs`);
    // PLAN 4 re-points the Requirement away from the Intent: the Cases that were justified only by it leave, the ones in the folder stay.
    c.put('02-requirements/F1-z/F1.md', EL('x/F1', { serves: ['x/I9'] }));
    c.put('02-requirements/F1-z/T70.test.mjs', CASE(70, ['x/F1']));
    assert.equal(seen(), 'T1 T4*', 'a relationship amended away must drop the Cases it alone justified');
    // DO 2 and DO 3 finish.
    c.mv('01-intent/I1-x/T4.red.mjs', '01-intent/I1-x/T4.test.mjs');
    assert.equal(seen(), 'T1 T4');
    // The Change record with no Intent justifies nothing outside its folder.
    c.put(`${CHANGE}/C999.md`, EL('x/C999'));
    assert.equal(seen(), 'T1');
    assert.equal(applicableCases(c.root, CHANGE).every((x) => !x.parked), true);
  } finally { rmSync(c.root, { recursive: true, force: true }); }
}
