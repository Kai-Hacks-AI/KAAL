// Case engineering/T1620 tests: engineering/F102
import assert from 'node:assert/strict';
import { FILES, entry, PLATFORM } from './fixture.mjs';
export const id = 'engineering/T1620';
export const tests = ['engineering/F102'];
export const title = 'the entry points exist, import Hosting and import no file system, process, path or operating system module';
export async function run() {
  for (const name of FILES) {
    const text = entry(name);
    assert.ok(text !== null, `13-source/controls/${name} is absent`);
    assert.ok(!PLATFORM.test(text), `${name} imports a platform module`);
  }
  assert.match(entry('hosting-files.mjs'), /@kaihacksai\/kaal-hosting/, 'hosting-files.mjs does not import Hosting');
}
