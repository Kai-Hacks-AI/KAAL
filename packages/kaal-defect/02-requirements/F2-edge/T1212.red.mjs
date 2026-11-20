// Case defect/T1212 tests: defect/F2
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
export const id = 'defect/T1212';
export const tests = ['defect/F2'];

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

export const title = 'a Case points at a Defect with its first line; the Defect lists no Case; several Cases may point at one Defect, in any context';
export async function run() {
  const d = fixture({ contexts: { 'a': { defects: ['x/D1'], cases: { 'x/T1': 'x/D1', 'x/T2': 'x/D1, x/I1' } }, 'b': { cases: { 'y/T3': 'x/D1' } } }, records: [rec('x/T1', 'GREEN'), rec('x/T2', 'GREEN'), rec('y/T3', 'GREEN')] });
  assert.ok(lines(check(d)).includes('answered x/D1'), 'all three Cases point at x/D1, so it is answered');
  const one = fixture({ contexts: { 'a': { defects: ['x/D1'], cases: { 'x/T1': 'x/D1', 'x/T2': 'x/D1' } } }, records: [rec('x/T1', 'GREEN')] });
  assert.ok(lines(check(one)).includes('unknown x/D1'), 'a Case with no record keeps it from being answered');
  const listed = fixture({ contexts: { 'a': { defects: ['x/D1'], register: ['x/D1'] } }, records: [rec('x/T1', 'RED')] });
  assert.ok(lines(check(listed)).includes('unknown x/D1 known'), 'a record of a Case that does not point at the Defect does not count: the Defect lists no Case');
}
