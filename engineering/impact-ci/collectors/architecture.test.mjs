import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'kaal-hosting';
import { inspect } from 'kaal-hosting/conformance';
import { fileURLToPath } from 'node:url';
const files = ['catalog.mjs', 'projection.mjs', 'report.mjs'];
const sources = async () => Object.fromEntries(await Promise.all(files.map(async file =>
  [file, await readFile(fileURLToPath(new URL(file, import.meta.url)))])));
const declaration = { builtins: [] };
test('N1 architecture permitted: pure collector modules declare no direct host imports', async () => {
  const result = await inspect(await sources(), declaration);
  assert.deepEqual(result.violations, []);
  assert.deepEqual(result.validation, []);
  assert.deepEqual(result.outside, []);
  // Hosting explicitly excludes resolution/meaning of relative imports.
  // Their responsibility and sole-evaluator use need the recorded source judgment.
});
test('N1 architecture prohibited: direct host access is located', async () => {
  const input = await sources();
  input['report.mjs'] = Buffer.concat([Buffer.from("import fs from 'node:fs';\n"), input['report.mjs']]);
  const result = await inspect(input, declaration);
  assert.deepEqual(result.violations.map(({file, line, builtin}) => ({file, line, builtin})),
    [{file: 'report.mjs', line: 1, builtin: 'node:fs'}]);
});
test('N1 architecture undecidable: dynamic host lookup requires validation', async () => {
  const input = await sources();
  input['report.mjs'] = Buffer.concat([input['report.mjs'], Buffer.from('\nprocess.getBuiltinModule("fs");\n')]);
  const result = await inspect(input, declaration);
  assert.deepEqual(result.violations, []);
  assert.deepEqual(result.validation.map(({file, construct}) => ({file, construct})),
    [{file: 'report.mjs', construct: 'process.getBuiltinModule'}]);
});
