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

// A tree: contexts hold Defect records, a register and Cases whose first line points at a Defect.
function fixture({ contexts, records = [] }) {
  assert.ok(existsSync(script), 'the script scripts/known-defects.mjs is absent');
  const d = mkdtempSync(join(tmpdir(), 'known-'));
  for (const [ctx, { defects = [], register = [], cases = {}, placed = {}, reaches = {} }] of Object.entries(contexts)) {
    mkdirSync(join(d, ctx, '15-defects'), { recursive: true });
    for (const i of defects) writeFileSync(join(d, ctx, '15-defects', i.replace('/', '-') + '.md'), `---\nid: ${i}\n${placed[i] ? `placed: ${placed[i]}\n` : ''}${reaches[i] === null ? '' : `reach: ${reaches[i] ?? '.'}\n`}---\n# ${i}\n`);
    writeFileSync(join(d, ctx, '15-defects', 'known.json'), JSON.stringify(register));
    for (const [c, target] of Object.entries(cases)) writeFileSync(join(d, ctx, `T${c.split('T')[1]}.red.mjs`), `// Case ${c} tests: ${target}\n`);
  }
  writeFileSync(join(d, 'records.json'), JSON.stringify(records));
  return d;
}
const R = 'r1';
const rec = (c, outcome, revision = R, run = '1', covers = ['.']) => ({ case: c, run, revision, outcome, covers });
const check = (d, ...more) => spawnSync(process.execPath, [script, '--root', d, '--records', join(d, 'records.json'), '--revision', R, ...more], { encoding: 'utf8' });
const lines = (r) => r.stdout.split('\n').filter(Boolean);

export const title = 'the to-fix list holds the registered Defects that are not answered, grouped by placed or by the holding context, each once';
export async function run() {
  const c = { 'a/b': { defects: ['x/D1', 'x/D2', 'x/D3', 'x/D4'], placed: { 'x/D1': 'c/d' }, register: ['x/D1', 'x/D2', 'x/D3'], cases: { 'x/T1': 'x/D1', 'x/T2': 'x/D1', 'x/T3': 'x/D2', 'x/T4': 'x/D3' } } };
  const r = check(fixture({ contexts: c, records: [rec('x/T1', 'RED'), rec('x/T2', 'RED'), rec('x/T3', 'GREEN'), rec('x/T4', 'UNKNOWN')] }), '--list');
  assert.equal(r.status, 0);
  assert.ok(lines(r).includes('c/d: x/D1'), 'placed in c/d, listed once');
  assert.ok(lines(r).includes('a/b: x/D3'), 'not placed: stays in the context that holds it');
  assert.ok(!r.stdout.includes('x/D2'), 'an answered Defect is not to fix');
  assert.ok(!r.stdout.includes('x/D4'), 'an unregistered Defect is not on the list');
}
