// Case defect/T1213 tests: defect/F3
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
export const id = 'defect/T1213';
export const tests = ['defect/F3'];

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

export const title = 'the state is derived from the Cases at a revision: one RED Case confirms, answered needs every Case GREEN, anything else is unknown; each Case keeps its own outcome beside it';
const ctx = (cases) => ({ 'a': { defects: ['x/D1'], cases } });
const one = ctx({ 'x/T1': 'x/D1' });
const state = (c, records) => lines(check(fixture({ contexts: c, records })))[0];
export async function run() {
  assert.equal(state(one, [rec('x/T1', 'RED')]), 'confirmed x/D1');
  assert.equal(state(one, [rec('x/T1', 'GREEN')]), 'answered x/D1', 'a derived state, nothing is stored on the Defect');
  assert.equal(state(one, [{ ...rec('x/T1', 'GREEN'), covers: ['nowhere/'] }]), 'answered x/D1', 'no coverage metadata is read: complete GREEN evidence answers');
  assert.equal(state(one, [rec('x/T1', 'GREEN', R, '1', false)]), 'unknown x/D1', 'a GREEN the runner did not establish as complete is unknown, not inferred from the record received');
  assert.equal(state(one, [{ case: 'x/T1', run: '1', revision: R, outcome: 'GREEN' }]), 'unknown x/D1', 'a GREEN with no completeness statement is unknown');
  assert.equal(state(one, [rec('x/T1', 'RED', R, '1', false)]), 'confirmed x/D1', 'a RED confirms the Defect whether or not the run is complete');
  assert.equal(state(one, [rec('x/T1', 'UNKNOWN')]), 'unknown x/D1');
  for (const outcome of ['skipped', 'error', 'timeout', 'incomplete']) assert.equal(state(one, [rec('x/T1', outcome)]), 'unknown x/D1', `${outcome} is neither RED nor GREEN`);
  assert.equal(state(one, []), 'unknown x/D1', 'no record is unknown');
  assert.equal(state(one, [rec('x/T1', 'RED', 'r0')]), 'unknown x/D1', 'a record of another revision is stale');
  assert.equal(state(ctx({}), []), 'unknown x/D1', 'no Case points at it: unknown');
  const two = ctx({ 'x/T1': 'x/D1', 'x/T2': 'x/D1' });
  assert.equal(state(two, [rec('x/T1', 'GREEN'), rec('x/T2', 'RED')]), 'confirmed x/D1', 'any applicable RED Case confirms it');
  assert.equal(state(two, [rec('x/T1', 'GREEN'), rec('x/T2', 'GREEN')]), 'answered x/D1', 'answered only when every Case is GREEN');
  assert.equal(state(two, [rec('x/T1', 'GREEN'), rec('x/T2', 'GREEN', R, '1', false)]), 'unknown x/D1', 'one incomplete run among the runs handed over keeps it unknown');
  assert.equal(state(two, [rec('x/T1', 'GREEN')]), 'unknown x/D1', 'a Case with no record leaves it unknown');
  assert.equal(state(two, [rec('x/T1', 'GREEN'), rec('x/T2', 'UNKNOWN')]), 'unknown x/D1');
  assert.equal(state(one, [rec('x/T1', 'GREEN', R, '1'), rec('x/T1', 'RED', R, '2')]), 'confirmed x/D1', 'one RED run at the revision shows the condition');
  const mixed = lines(check(fixture({ contexts: two, records: [rec('x/T1', 'RED')] })));
  assert.equal(mixed[0], 'confirmed x/D1', 'one RED Case confirms the Defect although the other Case has no record (UNKNOWN)');
  assert.ok(mixed.includes('  x/T1 RED') && mixed.includes('  x/T2 UNKNOWN'), 'each Case keeps its own outcome beside the derived state');
  assert.equal(mixed.filter((l) => /^\S+ x\/D/.test(l)).length, 1, 'several Cases are one Defect, not several');
  assert.equal(check(fixture({ contexts: one, records: [rec('x/T1', 'RED')] })).status, 0, 'no state makes the script fail: policy is the consumer\'s');
}
