import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execute } from 'kaal-hosting';
import { fileURLToPath } from 'node:url';
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
