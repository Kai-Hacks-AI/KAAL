// Case defect/T1211 tests: defect/F1
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync as lsDir } from 'node:fs';
import { dirname as parentOf } from 'node:path';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-defect');
const skillFile = join(pkg, 'skills/kaal-defect/SKILL.md');
const script = join(pkg, 'skills/kaal-defect/scripts/known-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); const refs = join(parentOf(skillFile), 'references'); return [skillFile, ...(existsSync(refs) ? lsDir(refs).sort().map((f) => join(refs, f)) : [])].map((f) => readFileSync(f, 'utf8')).join('\n'); }; // the Skill is SKILL.md and its references/
export const id = 'defect/T1211';
export const tests = ['defect/F1'];

// A tree: contexts hold Defect records, Architecture elements that address them and Cases whose first line points at a Defect.
function fixture({ contexts, records = [] }) {
  assert.ok(existsSync(script), 'the script scripts/known-defects.mjs is absent');
  const d = mkdtempSync(join(tmpdir(), 'known-'));
  const places = [];
  for (const [ctx, { defects = [], cases = {}, addresses = {} }] of Object.entries(contexts)) {
    mkdirSync(join(d, ctx, 'anywhere'), { recursive: true });
    places.push({ context: ctx, defects: join(d, ctx, 'anywhere'), architecture: [join(d, ctx, 'elsewhere')], cases: [join(d, ctx)] });
    for (const i of defects) writeFileSync(join(d, ctx, 'anywhere', i.replace('/', '-') + '.md'), `---\nid: ${i}\n---\n# ${i}\n`);
    mkdirSync(join(d, ctx, 'elsewhere'), { recursive: true });
    for (const [el, ids] of Object.entries(addresses)) writeFileSync(join(d, ctx, 'elsewhere', el.replace('/', '-') + '.md'), `---\nid: ${el}\naddresses: [${ids.join(', ')}]\n---\n`);
    for (const [c, target] of Object.entries(cases)) writeFileSync(join(d, ctx, `T${c.split('T')[1]}.red.mjs`), `// Case ${c} tests: ${target}\n`);
  }
  writeFileSync(join(d, 'records.json'), JSON.stringify(records));
  writeFileSync(join(d, 'places.json'), JSON.stringify(places));
  return d;
}
const R = 'r1';
const rec = (c, outcome, revision = R, run = '1', complete = true) => ({ case: c, run, revision, outcome, complete });
const check = (d, ...more) => spawnSync(process.execPath, [script, '--places', join(d, 'places.json'), '--records', join(d, 'records.json'), '--revision', R, ...more], { encoding: 'utf8' });
const lines = (r) => r.stdout.split('\n').filter(Boolean);

export const title = 'the inventory is every Defect record found in the contexts, the record is authoritative, and nothing is read from a second list';
export async function run() {
  const tree = fixture({ contexts: { 'a/b': { defects: ['x/D1', 'x/D2'] }, 'c': { defects: ['y/D1'] } } });
  const r = check(tree);
  assert.equal(r.status, 0);
  for (const id of ['x/D1', 'x/D2', 'y/D1']) assert.ok(lines(r).includes(`unknown ${id}`), `${id} is found from its record alone, in whatever context holds it`);
  assert.ok(!/\bknown\b/.test(r.stdout), 'no marker of membership: a record is what makes a Defect recorded');
  // A stray list of ids beside the records decides nothing.
  writeFileSync(join(tree, 'a/b/anywhere', 'known.json'), JSON.stringify(['x/D9']));
  assert.ok(!lines(check(tree)).some((l) => l.includes('x/D9')), 'an id that has no record is no Defect');
  // Nothing here knows a layout: the caller hands over where the Defects, the Architecture elements and the Cases are, whatever those are called.
  const places = JSON.parse(readFileSync(join(tree, 'places.json'), 'utf8'));
  assert.ok(places.every((p) => p.defects && p.cases), 'the fixture hands the locations over');
  const src = readFileSync(script, 'utf8');
  assert.ok(!/\d+-defects|known\.json|register|packages\/|engineering\//.test(src), 'the script names no folder, number, file or list of any layout');
}
