import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'kaal-hosting';
import { inspect } from 'kaal-hosting/conformance';
import { fileURLToPath } from 'node:url';
const modules = ['full-policy.mjs', 'assurance-policy.mjs', 'policy-identity.mjs', 'workflow-definitions.mjs',
  'full-gate.mjs', 'selection-contract.mjs', 'execution-gate.mjs', 'selection-gate.mjs', 'target-policy.mjs', 'replay.mjs'];
async function sources() {
  return Object.fromEntries(await Promise.all(modules.map(async p => [p, await readFile(fileURLToPath(new URL(p, import.meta.url)))])));
}
test('permitted: pure gate predicates leave host I/O and publication to external adapters', async () => {
  const r = await inspect(await sources(), { builtins: [] });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.validation, []);
});
test('prohibited: direct filesystem read inside a gate violates the declared pure boundary', async () => {
  const files = await sources();
  files['full-gate.mjs'] = Buffer.concat([Buffer.from('import fs from "node:fs";\n'), files['full-gate.mjs']]);
  const r = await inspect(files, { builtins: [] });
  assert.ok(r.violations.some(v => v.file === 'full-gate.mjs' && v.builtin === 'node:fs'));
});
test('undecidable: hidden host lookup is a validation item and cannot count as clean', async () => {
  const files = await sources();
  files['full-gate.mjs'] = Buffer.concat([files['full-gate.mjs'], Buffer.from('\nprocess.getBuiltinModule("fs");\n')]);
  const r = await inspect(files, { builtins: [] });
  assert.ok(r.validation.some(v => v.file === 'full-gate.mjs'));
});
