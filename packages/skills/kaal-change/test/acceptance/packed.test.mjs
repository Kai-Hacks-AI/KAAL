import { test } from 'node:test';
import assert from 'node:assert/strict';
import { install } from 'kaal-testing/acceptance';
import { execute, readFile, reconcile } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { join } from 'node:path';
test('change/T50 [change/F45, change/N11]: public packed consumer and tamper refusal', async () => {
  // Packed KAAL bytes are fixed by the run; Hosting/Graph also need registry dependencies.
  // Prefer the cache through Testing's default without requiring a warm metadata cache.
  const host = await install(['@kaihacksai/kaal-change', '@kaihacksai/kaal-foundation', 'kaal-graph', 'kaal-hosting']);
  const smoke = await execute(process.execPath, ['--input-type=module', '--eval',
    "import {isolate} from '@kaihacksai/kaal-change/isolation'; if(isolate({},{}).assessment!=='violated') process.exit(1);"], { cwd: host });
  assert.equal(smoke.status, 0, smoke.stderr);
  const command = ['explore', '@kaihacksai/kaal-change', '--', 'npm', 'test'];
  const result = await execute('npm', command, { cwd: host });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const summary = JSON.parse(result.stdout.trim().split('\n').at(-1).slice('kaal-change-verification '.length));
  assert.equal(summary.result, 'verified');
  assert.equal(summary.cases.length, 9);
  assert.ok(summary.cases.every(c => c.outcome === 'pass'));
  const at = 'node_modules/@kaihacksai/kaal-change/lib/isolation.mjs';
  const bytes = await readFile(join(host, at));
  await reconcile(host, { write: [{ path: at, expect: sha256(bytes), bytes: Buffer.concat([bytes, Buffer.from('\n// changed\n')]) }], remove: [] });
  const tampered = await execute('npm', command, { cwd: host });
  assert.notEqual(tampered.status, 0);
  assert.match(tampered.stdout, /cannot verify/);
  await reconcile(host, { write: [{ path: at, expect: sha256(Buffer.concat([bytes, Buffer.from('\n// changed\n')])), bytes }], remove: [] });
  const inventoryPath = 'node_modules/@kaihacksai/kaal-change/test/verify.json';
  const inventoryBytes = await readFile(join(host, inventoryPath));
  const inventory = JSON.parse(inventoryBytes);
  const casePath = 'node_modules/@kaihacksai/kaal-change/test/embed/isolation.test.mjs';
  const caseBytes = await readFile(join(host, casePath));
  // A self-consistent inventory still cannot turn an unexecuted Case GREEN.
  const skippedBytes = Buffer.from(caseBytes.toString().replace("test('change/T41", "test.skip('change/T41"));
  const skippedInventory = Buffer.from(JSON.stringify({ ...inventory,
    files: { ...inventory.files, 'test/embed/isolation.test.mjs': sha256(skippedBytes) } }));
  await reconcile(host, { write: [{ path: casePath, expect: sha256(caseBytes), bytes: skippedBytes },
    { path: inventoryPath, expect: sha256(inventoryBytes), bytes: skippedInventory }], remove: [] });
  const skipped = await execute('npm', command, { cwd: host });
  assert.notEqual(skipped.status, 0);
  assert.match(skipped.stdout, /cannot verify/);
  const failingBytes = Buffer.from(caseBytes.toString().replace("assert.equal(isolate(proposal, model).assessment, 'isolated')", "assert.equal(isolate(proposal, model).assessment, 'deliberately wrong')"));
  const failingInventory = Buffer.from(JSON.stringify({ ...inventory,
    files: { ...inventory.files, 'test/embed/isolation.test.mjs': sha256(failingBytes) } }));
  await reconcile(host, { write: [{ path: casePath, expect: sha256(skippedBytes), bytes: failingBytes },
    { path: inventoryPath, expect: sha256(skippedInventory), bytes: failingInventory }], remove: [] });
  const failed = await execute('npm', command, { cwd: host });
  assert.notEqual(failed.status, 0);
  assert.match(failed.stdout, /"result":"failed"/);
  await reconcile(host, { write: [{ path: inventoryPath, expect: sha256(failingInventory),
    bytes: Buffer.from(JSON.stringify({ ...inventory, cases: [] })) }], remove: [] });
  const empty = await execute('npm', command, { cwd: host });
  assert.notEqual(empty.status, 0);
  assert.match(empty.stdout, /cannot verify/);
});
