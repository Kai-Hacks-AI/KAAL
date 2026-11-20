// Case defect/T1211 tests: defect/F1
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
export const id = 'defect/T1211';
export const tests = ['defect/F1'];

// A tree: contexts hold Defect records, a register and Cases whose first line points at a Defect.
function fixture({ contexts, records = [] }) {
  assert.ok(existsSync(script), 'the script scripts/known-defects.mjs is absent');
  const d = mkdtempSync(join(tmpdir(), 'known-'));
  for (const [ctx, { defects = [], register = [], cases = {}, placed = {} }] of Object.entries(contexts)) {
    mkdirSync(join(d, ctx, '14-defects'), { recursive: true });
    for (const i of defects) writeFileSync(join(d, ctx, '14-defects', i.replace('/', '-') + '.md'), `---\nid: ${i}\n${placed[i] ? `placed: ${placed[i]}\n` : ''}---\n# ${i}\n`);
    writeFileSync(join(d, ctx, '14-defects', 'known.json'), JSON.stringify(register));
    for (const [c, target] of Object.entries(cases)) writeFileSync(join(d, ctx, `T${c.split('T')[1]}.red.mjs`), `// Case ${c} tests: ${target}\n`);
  }
  writeFileSync(join(d, 'records.json'), JSON.stringify(records));
  return d;
}
const R = 'r1';
const rec = (c, outcome, revision = R, run = '1') => ({ case: c, run, revision, outcome });
const check = (d, ...more) => spawnSync(process.execPath, [script, '--root', d, '--records', join(d, 'records.json'), '--revision', R, ...more], { encoding: 'utf8' });
const lines = (r) => r.stdout.split('\n').filter(Boolean);

export const title = 'a register is read in its context, marks its Defects known, and an id with no Defect record in that folder is invalid';
export async function run() {
  const ok = check(fixture({ contexts: { 'a/b': { defects: ['x/D1', 'x/D2'], register: ['x/D1'] } } }));
  assert.equal(ok.status, 0);
  assert.ok(lines(ok).includes('unknown x/D1 known'), 'registered: known');
  assert.ok(lines(ok).includes('unknown x/D2'), 'not registered: not known');
  const bad = check(fixture({ contexts: { 'a/b': { defects: ['x/D1'], register: ['x/D9'] } } }));
  assert.ok(lines(bad).includes('invalid x/D9'));
  const other = check(fixture({ contexts: { 'a/b': { register: ['x/D1'] }, 'c': { defects: ['x/D1'] } } }));
  assert.ok(lines(other).includes('invalid x/D1'), 'a Defect in another context does not satisfy the entry');
}
