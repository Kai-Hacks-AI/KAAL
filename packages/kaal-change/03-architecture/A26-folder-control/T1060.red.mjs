// Case change/T1060 tests: change/A26
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGE, CONTROL } from '../../test/folder-control-support.mjs';
export const id = 'change/T1060';
export const tests = ['change/A26'];
export const title = 'the folder control is one pure module that imports only node:path, writes and executes nothing, takes its views from the caller, depends on no Guard package, and the wrapper reaches Git only through Hosting, reads the evaluations a run produced and runs no test';
export async function run() {
  assert.ok(existsSync(CONTROL), 'the folder control is absent');
  const src = readFileSync(CONTROL, 'utf8');
  const imports = [...src.matchAll(/^import .* from ["']([^"']+)["']/gm)].map((m) => m[1]);
  assert.deepEqual(imports.filter((i) => i !== 'node:path'), [], 'the control imports more than node:path');
  assert.ok(!/child_process|writeFile|appendFile|mkdir|rmSync|\bspawn|process\./.test(src), 'the control writes, executes or reads the process');
  assert.ok(!/kaal-guard['"]|@kaihacksai\/kaal-guard/.test(src.replace(/kaal-guard\.json/g, '')), 'the control depends on Guard; it may name only the file kaal-guard.json');
  const cli = join(PACKAGE, 'skills/kaal-change/scripts/folder-control-cli.mjs');
  assert.ok(existsSync(cli), 'the wrapper is absent');
  const wrapper = readFileSync(cli, 'utf8');
  assert.ok(/@kaihacksai\/kaal-hosting/.test(wrapper) && !/node:child_process/.test(wrapper), 'the wrapper does not reach Git through Hosting');
  assert.ok(/--evidence/.test(wrapper), 'the wrapper does not read the evaluations of a run');
  assert.ok(!/replay|node --test|spawn/.test(wrapper), 'the wrapper runs tests itself');
}
test(id, () => run());
