// Case release/T1311 tests: release/F87
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const LIB = join(RM, '05-src/phase/lib');
const use = (name) => { const f = join(LIB, name); assert.ok(existsSync(f), `lib/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1311';
export const tests = ['release/F87'];
export const title = 'the library reads a tree and the facts of a collector: Given a collector folder, When its files, Change, Cases and retros are read, Then they are the same facts hold Act has always found';
const CHANGE = '00-changes/C999-demo';
const CASE = (n, tests) => `export const ${'id'} = 'x/T${n}';\nexport const tests = [${tests.map((t) => `'${t}'`).join(', ')}];\nexport const title = 't';\nexport async function run() {}\n`;
const EL = (id, edges = {}) => `---\nid: ${id}\n${Object.entries(edges).map(([k, v]) => `${k}: [${v.join(', ')}]`).join('\n')}\n---\n# ${id}\n`;
export async function run() {
  const tree = await use('tree.mjs');
  const col = await use('collector.mjs');
  const root = mkdtempSync(join(tmpdir(), 'c112-'));
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), t); };
  // Given a collector: one Change that implements an Intent, a Requirement and an Architecture element under it, two Cases (one parked), and one retro.
  put(`${CHANGE}/C999.md`, EL('x/C999', { implements: ['x/I1'] }));
  put('01-intent/I1/I1.md', EL('x/I1'));
  put('02-requirements/F1/F1.md', EL('x/F1', { serves: ['x/I1'] }));
  put('03-architecture/A1/A1.md', EL('x/A1', { addresses: ['x/F1'] }));
  put(`${CHANGE}/T1.red.mjs`, CASE(1, ['x/F1']));
  put('03-architecture/A1/T3.test.mjs', CASE(3, ['x/A1']));
  put('03-architecture/A9/T9.test.mjs', CASE(9, ['x/A9']));
  put('02-learnings/retros/RT1.md', '---\nid: x/RT1\nformat: 4L\nreflects: [x/C999, x/C998]\n---\n# retro\n');
  // The tree: files in a fixed order, the frontmatter as keys and lists, none when there is none.
  assert.deepEqual(tree.walk(join(root, '03-architecture')).map((p) => p.slice(root.length + 1)), ['03-architecture/A1/A1.md', '03-architecture/A1/T3.test.mjs', '03-architecture/A9/T9.test.mjs']);
  assert.deepEqual(tree.walk(join(root, 'nothing-here')), []);
  assert.deepEqual(tree.frontmatter(EL('x/F1', { serves: ['x/I1', 'x/I2'] })), { id: 'x/F1', serves: ['x/I1', 'x/I2'] });
  assert.equal(tree.frontmatter('# no frontmatter\n'), null);
  // The facts of the collector.
  assert.equal(col.changeIdOf(root, CHANGE), 'x/C999');
  assert.equal(col.changeIdOf(root, '00-changes/C000-none'), undefined);
  assert.deepEqual([...col.justifiedBy(col.elementsOf(root, CHANGE), { implements: ['x/I1'] })].sort(), ['x/A1', 'x/C999', 'x/F1', 'x/I1']);
  assert.deepEqual(col.applicableCases(root, CHANGE).map((c) => [c.id, c.parked]), [['x/T1', true], ['x/T3', false]]);
  assert.deepEqual(col.retrosOf(root), [{ reflects: ['x/C999', 'x/C998'] }]);
  assert.deepEqual(col.carriedChanges(root, [CHANGE]).map((c) => [c.id, c.applicable.length]), [['x/C999', 2]]);
  assert.throws(() => col.carriedChanges(root, ['00-changes/C000-none']), /carried Changes are not known/);
}
