import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'kaal-hosting';
import { inspect } from 'kaal-hosting/conformance';
import { fileURLToPath } from 'node:url';
const files = ['auth.mjs','acquire.mjs','controller.mjs'];
const sources = async () => Object.fromEntries(await Promise.all(files.map(async f => [f, await readFile(fileURLToPath(new URL(f, import.meta.url)))])));
test('architecture permitted: no direct host, credential, network or alternative digest implementation', async () => {
  const r = await inspect(await sources(), { builtins: [] });
  assert.deepEqual(r.violations, []); assert.deepEqual(r.validation, []);
  assert.deepEqual([...new Set(r.outside.map(x => x.specifier))], ['@kaihacksai/kaal-foundation/sha256']);
});
test('architecture prohibited: direct filesystem import is located', async () => {
  const f = await sources(); f['acquire.mjs'] = Buffer.concat([Buffer.from("import fs from 'node:fs';\n"), f['acquire.mjs']]);
  const r = await inspect(f, { builtins: [] });
  assert.deepEqual(r.violations.map(({file,line,builtin}) => ({file,line,builtin})), [{ file:'acquire.mjs',line:1,builtin:'node:fs' }]);
});
test('architecture undecidable: dynamic host lookup requires judgment', async () => {
  const f = await sources(); f['acquire.mjs'] = Buffer.concat([f['acquire.mjs'], Buffer.from('\nprocess.getBuiltinModule("fs");\n')]);
  const r = await inspect(f, { builtins: [] });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.validation.map(({file,construct}) => ({file,construct})), [{file:'acquire.mjs',construct:'process.getBuiltinModule'}]);
});
