// Case defect/T1215 tests: defect/F4
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-defect');
const skillFile = join(pkg, 'skills/kaal-defect/SKILL.md');
const script = join(pkg, 'skills/kaal-defect/scripts/known-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); return readFileSync(skillFile, 'utf8'); };
export const id = 'defect/T1215';
export const tests = ['defect/F4'];

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

export const title = 'the to-fix list holds every Defect record that is not answered, grouped by the context of the Architecture element that addresses it, else by the holding context';
export async function run() {
  const c = {
    'a/b': { defects: ['x/D1', 'x/D2', 'x/D3', 'x/D4'], cases: { 'x/T1': 'x/D1', 'x/T2': 'x/D1', 'x/T3': 'x/D2', 'x/T4': 'x/D3' } },
    'c/d': { addresses: { 'z/A1': ['x/D1'] } },
  };
  const r = check(fixture({ contexts: c, records: [rec('x/T1', 'RED'), rec('x/T2', 'RED'), rec('x/T3', 'GREEN'), rec('x/T4', 'UNKNOWN')] }), '--list');
  assert.equal(r.status, 0);
  assert.ok(lines(r).includes('c/d: x/D1'), 'addressed by an Architecture element in c/d: its correction belongs there');
  assert.ok(lines(r).includes('a/b: x/D3, x/D4'), 'not addressed: it stays with the context that holds it, with no Case and unknown alike');
  assert.ok(!r.stdout.includes('x/D2'), 'an answered Defect is not to fix');
  assert.ok(!/placed/.test(readFileSync(script, 'utf8')), 'there is no placed field: Architecture addresses, Defect only reads');
  const moved = check(fixture({ contexts: c, records: [] }), '--list');
  assert.ok(!lines(moved).some((l) => l.startsWith('a/b:') && l.includes('x/D1')), 'a Defect that is addressed elsewhere is not also listed where found');
}
