import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execute, read, readFile } from 'kaal-hosting';
import { fixture, entryFiles, npmTest } from './verification-fixture.mjs';
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

test('change/T58 [change/F50]: source npm test observes publisher failure and refuses ambiguous layouts', async () => {
  await fixture(await entryFiles(), async at => {
    const run = await npmTest(at);
    assert.equal(run.status, 1, 'source entry must fail when its publisher suite fails: ' + run.stdout + run.stderr);
    assert.match(run.stdout, /publisher observed/);
    assert.equal(run.stdout.trim().split('\n').at(-1), 'failed');
  });
  await fixture(await entryFiles({ publisher: 0 }), async at => {
    const run = await npmTest(at);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.equal(run.stdout.match(/publisher observed/g)?.length, 1);
    assert.equal(run.stdout.trim().split('\n').at(-1), 'verified');
  });
  for (const installed of [false, true]) {
    await fixture(await entryFiles({ markers: installed }), async at => {
      const run = await npmTest(at);
      assert.equal(run.status, 2, 'ambiguous source/installed layout must be refused');
      assert.match(run.stdout, /cannot verify:/);
      assert.doesNotMatch(run.stdout, /publisher observed/);
      if (installed) {
        const summary = JSON.parse(run.stdout.trim().split('\n').at(-1).replace(/^kaal-change-verification /, ''));
        assert.equal(summary.result, 'cannot verify');
        assert.deepEqual(summary.cases, []);
      }
    }, { installed });
  }
});

test('change/T59 [change/F50]: installed npm test preserves the embedded result and last summary', async () => {
  for (const exit of [0, 1, 2]) await fixture(await entryFiles({ exit, markers: false }), async at => {
    const run = await npmTest(at);
    assert.equal(run.status, exit, run.stdout + run.stderr);
    assert.doesNotMatch(run.stdout, /publisher observed/);
    const summary = JSON.parse(run.stdout.trim().split('\n').at(-1).replace(/^kaal-change-verification /, ''));
    assert.equal(summary.exit, exit);
  }, { installed: true });
});

test('change/T60 [change/F52]: malformed inventory reports cannot verify with a cause and summary', async () => {
  const base = Object.fromEntries(await Promise.all(['package.json', 'test/verify.mjs', 'test/observe.mjs']
    .map(async path => [path, await readFile(join(root, path))])));
  for (const bytes of ['null\n', '[]\n', '{}\n', '0\n', '"inventory"\n', '{']) {
    await fixture({ ...base, 'test/verify.json': Buffer.from(bytes) }, async at => {
      const run = await execute(process.execPath, ['test/verify.mjs'], { cwd: at });
      assert.equal(run.status, 2, 'malformed inventory must be cannot verify: ' + run.stdout + run.stderr);
      const record = JSON.parse(run.stdout.trim().split('\n').at(-1).replace(/^kaal-change-verification /, ''));
      assert.equal(record.result, 'cannot verify');
      assert.equal(record.exit, 2);
      assert.deepEqual(record.cases, []);
      assert.ok(record.causes.length > 0);
    }, { installed: true });
  }
});

test('change/T61 [change/F51]: the delivered manifest preserves the authored Case traces exactly', async () => {
  const manifest = JSON.parse(await readFile(join(root, 'test/verify.json')));
  const authored = JSON.parse(await readFile(join(root, 'test/publisher/model.json')));
  assert.deepEqual(manifest.model, authored);
  assert.deepEqual(authored.cases.map(c => c.id).sort(), [...manifest.cases].sort());
});
