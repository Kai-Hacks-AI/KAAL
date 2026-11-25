import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execute, readFile } from '@kaihacksai/kaal-hosting';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
test('change/T51 [change/F46, change/F47]: the delivered skill command exposes qualified isolation and omission challenges', async () => {
  const run = await execute(process.execPath, ['skills/kaal-change/scripts/example.mjs'], { cwd: root });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const { examples } = JSON.parse(run.stdout);
  assert.deepEqual(examples.map(e => [e.name, e.assessment]), [
    ['complete-model', 'isolated'], ['missing-interface', 'unknown'], ['new-dependent', 'isolated']]);
  for (const e of examples) {
    assert.equal(e.authority, 'unestablished');
    assert.equal(e.execution, 'not-assessed');
    assert.equal(e.evidence, 'controlled-example');
  }
  assert.deepEqual(examples[0].boundaries.map(b => b.direction).sort(), ['incoming', 'outgoing']);
  assert.ok(examples[0].obligations.includes('real-subject'));
  assert.ok(examples[0].obligations.includes('contract'));
  assert.ok(examples[0].obligations.includes('real-integration'));
  assert.ok(examples[1].findings.includes('missing-interface'));
  assert.ok(examples[2].affectedOutside.includes('audit/A1'));
});
const guide = async () => (await readFile(join(root, 'skills/kaal-change/references/transition.md'))).toString('utf8');
const impact = async () => {
  const t = await guide(), i = t.indexOf('## Impact and adoption');
  assert.ok(i >= 0, 'the guide has no Impact and adoption section');
  const j = t.indexOf('\n## ', i + 3);
  return j < 0 ? t.slice(i) : t.slice(i, j);
};
const has = (s, words) => { for (const w of words) assert.ok(s.includes(w), 'missing: ' + w); };
test('change/T1361 [change/G16]: the transition guide has an Impact and adoption section that asks what becomes different, who is affected and what could go wrong', async () => {
  has(await impact(), ['## Impact and adoption', '**What becomes different?**', '**Who is affected?**', '**What could go wrong?**', 'will now be refused']);
});
test('change/T1362 [change/G16]: the guide asks whether the delivery passes under its own rule and who already under way a stricter rule stops', async () => {
  has(await impact(), ['own delivery pass under the rule it changes', 'work already under way that it would now stop, and count it']);
});
test('change/T1363 [change/G16]: the guide asks how the result reaches those affected without prescribing steps', async () => {
  has(await impact(), ['**How does the result reach those affected?**', 'available', 'integrated', 'active', 'coincide', 'One step is a valid answer', 'No sequence is prescribed']);
});
test('change/T1364 [change/G16]: the guide marks claims stated, observed or inferred, says not known is never none, and allows one line for a small Change', async () => {
  has(await impact(), ['**stated**', '**observed**', '**inferred**', 'not known, never none', 'one line is enough']);
});
test('change/T1365 [change/G16]: the section stays agnostic: no vocabulary of KAAL delivery and no assumption of a repository', async () => {
  const s = (await impact()).toLowerCase();
  for (const w of ['kaal', 'collector', 'sync', 'wire', 'promot', 'ruleset', 'guard', 'repository', 'pull request', 'branch', 'commit']) assert.ok(!s.includes(w), 'the section names ' + w);
});
test('change/T1366 [change/G16]: the Skill points to the Impact and adoption section', async () => {
  await impact();
  assert.ok((await readFile(join(root, 'skills/kaal-change/SKILL.md'))).toString('utf8').includes('Impact and adoption'), 'the Skill does not point to the section');
});
