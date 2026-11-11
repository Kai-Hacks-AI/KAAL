// Case release/T88 tests: F7
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const interpreterFile = join(repo, 'engineering/release-management/05-src/dependency-analysis/interpreter.mjs');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const interpreterModule = () => { assert.ok(existsSync(interpreterFile), 'the interpreter is absent'); return import(pathToFileURL(interpreterFile).href); };
export const id = 'release/T88';
export const tests = ['release/F7'];
export const title = 'a mechanism that fails without a result is UNKNOWN and never passes';
export async function run() {
  const m = await interpreterModule();
  
  for (const result of [{ conclusion: 'failure', outputs: {} }, { conclusion: 'success', outputs: { vulnerableChanges: 'not json' } }, { conclusion: 'success', outputs: {} }, undefined]) {
    const v = m.interpret(result);
    assert.equal(v.outcome, 'UNKNOWN');
    assert.equal(v.passes, false, 'UNKNOWN must not pass');
  }
}
