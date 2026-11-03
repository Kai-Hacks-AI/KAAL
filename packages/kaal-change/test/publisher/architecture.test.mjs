import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'kaal-hosting';
import { inspect } from 'kaal-hosting/conformance';
import { fileURLToPath } from 'node:url';
const root = new URL('../../', import.meta.url);
test('change/T48 [change/N9, change/N10]: permitted/prohibited/undecidable pure-core boundary', async () => {
  const source = await readFile(fileURLToPath(new URL('lib/isolation.mjs', root)));
  const allowed = await inspect({ 'isolation.mjs': source }, { builtins: [] });
  assert.deepEqual(allowed.violations, []);
  assert.deepEqual(allowed.outside.map(x => x.specifier), ['@kaihacksai/kaal-foundation/sha256']);
  assert.deepEqual(allowed.validation, []);
  const forbidden = await inspect({ 'isolation.mjs': Buffer.concat([Buffer.from('import { readFileSync } from "node:fs";\n'), source]) }, { builtins: [] });
  assert.ok(forbidden.violations.some(v => v.builtin === 'node:fs'));
  const unknown = await inspect({ 'isolation.mjs': Buffer.concat([source, Buffer.from('\nprocess.getBuiltinModule("fs");\n')]) }, { builtins: [] });
  assert.equal(unknown.violations.length, 0);
  assert.ok(unknown.validation.length > 0);
  assert.ok(allowed.exclusions.length > 0);
});
