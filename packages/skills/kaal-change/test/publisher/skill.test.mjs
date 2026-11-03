import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { read, execute } from 'kaal-hosting';
import { evaluate, payload, foundation } from 'kaal-core';
const root = fileURLToPath(new URL('../../', import.meta.url));
test('change/T52 [change/F46, change/N12]: Core admits the Change Practice Skill and Engineer Skill checks its Agent Skill', async () => {
  const e = evaluate({ ...payload(), ...await read(join(root, 'payload')) });
  assert.deepEqual(e.rejected, []);
  assert.ok(e.nodes.some(n => n.name === 'Change Practice' && n.type?.id === foundation().skill.id));
  const run = await execute('npm', ['exec', '--no', '--', 'kaal-engineer-skill', join(root, 'skills/kaal-change')], { cwd: root });
  assert.equal(run.status, 0, run.stdout + run.stderr);
});
