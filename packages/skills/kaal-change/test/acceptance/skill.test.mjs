import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { install } from 'kaal-testing/acceptance';
import { execute, read, initialize, readFile, reconcile } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';

const packages = ['@kaihacksai/kaal-change', '@kaihacksai/kaal-foundation', 'kaal-graph',
  'kaal-hosting', 'kaal-core', 'kaal-engineer-skill'];
async function run(host, script, args = [], cwd = host) {
  const r = await execute(process.execPath, [script, ...args], { cwd });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  return r.stdout;
}

test('change/T53 [change/F46, change/F47, change/N12]: installed skill works after relocation in an External operator environment without changing its target', async () => {
  const host = await install(packages);
  const installed = join(host, 'node_modules/@kaihacksai/kaal-change/skills/kaal-change');
  const held = await read(installed);
  assert.ok(held['SKILL.md']);
  const relocated = join(host, 'operator/arbitrary/kaal-change');
  await initialize(relocated, held);
  const checker = join(host, 'node_modules/kaal-engineer-skill/skills/kaal-engineer-skill/scripts/check-skill.mjs');
  await run(host, checker, [relocated]);
  const target = join(host, 'separately-managed-target');
  await initialize(target, { 'README.md': Buffer.from('# Target\n'),
    'package.json': Buffer.from('{"name":"target","private":true}\n') });
  const before = await read(target);
  const demo = JSON.parse(await run(host, join(relocated, 'scripts/example.mjs'), [], target));
  assert.equal(demo.examples.length, 3);
  assert.equal(demo.examples[1].assessment, 'unknown');
  assert.ok(demo.examples.every(e => e.authority === 'unestablished' && e.execution === 'not-assessed'));
  assert.deepEqual(await read(target), before, 'External example must leave every target byte unchanged');
  // Exercise the public skill checker against an actually broken delivered reference.
  const bytes = await readFile(join(relocated, 'SKILL.md'));
  await reconcile(relocated, { write: [{ path: 'SKILL.md', expect: sha256(bytes),
    bytes: Buffer.concat([bytes, Buffer.from('\nRead [missing evidence](references/not-present.md).\n')]) }], remove: [] });
  const broken = await execute(process.execPath, [checker, relocated], { cwd: host });
  assert.equal(broken.status, 1, broken.stdout + broken.stderr);
  assert.match(broken.stdout + broken.stderr, /not-present/);
});

test('change/T54 [change/F46, change/F48]: a clean consumer admits the packaged Change Practice through Core and verifies the complete 0.0.1 package', async () => {
  const host = await install(packages);
  const installed = join(host, 'node_modules/@kaihacksai/kaal-change');
  const cli = join(host, 'node_modules/kaal-core/dist/cli.js');
  const engine = join(host, 'consumer/custom-engine');
  await run(host, cli, ['init', '--engine', engine]);
  const before = JSON.parse(await run(host, '--input-type=module', ['--eval',
    "import {verify} from 'kaal-core';let v=await verify(process.argv[1]);console.log(JSON.stringify(v.engine.nodes.map(n=>n.id).sort()));", engine]));
  await run(host, cli, ['register', 'skill', 'change', join(installed, 'payload'), '--engine', engine]);
  const observed = JSON.parse(await run(host, '--input-type=module', ['--eval',
    "import {verify} from 'kaal-core';let v=await verify(process.argv[1]);console.log(JSON.stringify({ok:v.ok,nodes:v.engine.nodes.map(n=>({id:n.id,name:n.name,type:n.type}))}));", engine]));
  assert.equal(observed.ok, true);
  const practice = observed.nodes.find(n => n.name === 'Change Practice');
  assert.equal(practice.type.name, 'KAAL Skill');
  assert.deepEqual(observed.nodes.map(n => n.id).sort(), [...before, practice.id].sort());
  const verified = await run(host, join(installed, 'test/verify.mjs'));
  const result = JSON.parse(verified.trim().split('\n').at(-1).slice('kaal-change-verification '.length));
  assert.equal(result.result, 'verified');
  assert.equal(result.provenance.version, '0.0.1');
  assert.equal(result.cases.length, 9);
  assert.ok(result.cases.every(c => c.outcome === 'pass'));
});
