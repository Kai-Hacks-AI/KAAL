// Case defect/T1216 tests: defect/F5
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
export const id = 'defect/T1216';
export const tests = ['defect/F5'];

// A tree: contexts hold Defect records, a register and Cases whose first line points at a Defect.
function fixture({ contexts, records = [] }) {
  assert.ok(existsSync(script), 'the script scripts/known-defects.mjs is absent');
  const d = mkdtempSync(join(tmpdir(), 'known-'));
  for (const [ctx, { defects = [], register = [], cases = {}, placed = {}, reaches = {} }] of Object.entries(contexts)) {
    mkdirSync(join(d, ctx, '14-defects'), { recursive: true });
    for (const i of defects) writeFileSync(join(d, ctx, '14-defects', i.replace('/', '-') + '.md'), `---\nid: ${i}\n${placed[i] ? `placed: ${placed[i]}\n` : ''}${reaches[i] === null ? '' : `reach: ${reaches[i] ?? '.'}\n`}---\n# ${i}\n`);
    writeFileSync(join(d, ctx, '14-defects', 'known.json'), JSON.stringify(register));
    for (const [c, target] of Object.entries(cases)) writeFileSync(join(d, ctx, `T${c.split('T')[1]}.red.mjs`), `// Case ${c} tests: ${target}\n`);
  }
  writeFileSync(join(d, 'records.json'), JSON.stringify(records));
  return d;
}
const R = 'r1';
const rec = (c, outcome, revision = R, run = '1', covers = ['.']) => ({ case: c, run, revision, outcome, covers });
const check = (d, ...more) => spawnSync(process.execPath, [script, '--root', d, '--records', join(d, 'records.json'), '--revision', R, ...more], { encoding: 'utf8' });
const lines = (r) => r.stdout.split('\n').filter(Boolean);

export const title = 'a Defect claims its reach; a part of the reach that no GREEN Case covers keeps it unknown, an unclaimed reach cannot be answered, and a RED Case confirms whatever the reach';
const defect = (reach, cases) => ({ 'a': { defects: ['x/D1'], reaches: { 'x/D1': reach }, cases } });
const two = { 'x/T1': 'x/D1', 'x/T2': 'x/D1' };
const out = (c, records) => lines(check(fixture({ contexts: c, records })));
export async function run() {
  const part = out(defect('packages/, .kaal/', two), [rec('x/T1', 'GREEN', R, '1', ['packages/']), rec('x/T2', 'GREEN', R, '1', ['packages/'])]);
  assert.equal(part[0], 'unknown x/D1', 'every Case is GREEN but .kaal/ is covered by none: unknown, never answered');
  assert.ok(part.includes('  uncovered .kaal/'), 'the uncovered part is named');
  const whole = out(defect('packages/, .kaal/', two), [rec('x/T1', 'GREEN', R, '1', ['packages/']), rec('x/T2', 'GREEN', R, '1', ['.kaal/'])]);
  assert.equal(whole[0], 'answered x/D1', 'every part of the reach is covered by a GREEN Case');
  assert.ok(!whole.some((l) => l.includes('uncovered')));
  assert.equal(out(defect('packages/, .kaal/', two), [rec('x/T1', 'RED', R, '1', ['packages/'])])[0], 'confirmed x/D1', 'one RED Case confirms the Defect, covered or not');
  const unclaimed = out(defect(null, { 'x/T1': 'x/D1' }), [rec('x/T1', 'GREEN')]);
  assert.equal(unclaimed[0], 'unknown x/D1', 'a Defect that claims no reach cannot be answered');
  assert.ok(unclaimed.includes('  reach unclaimed'));
  const repo = defect('.', { 'x/T1': 'x/D1' });
  assert.equal(out(repo, [rec('x/T1', 'GREEN', R, '1', ['packages/'])])[0], 'unknown x/D1', 'a repository-wide claim is not covered by one directory');
  assert.equal(out(repo, [rec('x/T1', 'GREEN', R, '1', ['.'])])[0], 'answered x/D1');
  assert.equal(out(defect('packages/kaal-core', { 'x/T1': 'x/D1' }), [rec('x/T1', 'GREEN', R, '1', ['packages/'])])[0], 'answered x/D1', 'a covered directory covers the part under it');
  assert.equal(out(defect('packages/', { 'x/T1': 'x/D1' }), [rec('x/T1', 'UNKNOWN', R, '1', ['packages/'])])[0], 'unknown x/D1', 'an UNKNOWN run covers nothing');
  assert.equal(out(defect('packages/', { 'x/T1': 'x/D1' }), [rec('x/T1', 'GREEN', 'r0', '1', ['packages/'])])[0], 'unknown x/D1', 'a stale run covers nothing');
}
