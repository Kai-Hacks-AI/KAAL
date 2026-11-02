import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execute, read, readFile } from 'kaal-hosting';
import { evaluate, payload, foundation } from 'kaal-core';
import { readClaim } from 'kaal-testing/attribution';
const root = fileURLToPath(new URL('../../', import.meta.url));
test('minimal Change foundation is Core-admitted and its narrow claim resolves exactly', async () => {
  const nodes = await read(join(root, 'capability'));
  const engine = evaluate({ ...payload(), ...nodes });
  assert.deepEqual(engine.rejected, []);
  const owner = engine.nodes.find(n => n.name === 'Change' && n.type?.id === foundation().capability.id);
  assert.ok(owner);
  const declared = readClaim('packages/skills/kaal-change/ownership.kaal.json', await readFile(join(root, 'ownership.kaal.json')));
  assert.equal(declared.finding, undefined);
  assert.deepEqual(declared.claim.owner, { kind: 'capability', name: owner.name, id: owner.id });
  assert.deepEqual(declared.claim.paths, ['packages/skills/kaal-change/']);
  assert.ok(engine.nodes.some(n => n.name === 'Change Isolation' && n.type?.id === foundation().definition.id));
});
test('public declarations accept the existing Graph view and reject unrelated CI transport', async () => {
  const result = await execute('npm', ['exec', '--no', '--', 'tsc', '--strict', '--noEmit',
    '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--skipLibCheck',
    'test/publisher/consumer.ts'], { cwd: root });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
