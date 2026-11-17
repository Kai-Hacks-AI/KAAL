// Case release/T724 tests: release/CTL4
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { directory, run as record, judge } from './fixtures.mjs';
const RM = join(fileURLToPath(import.meta.url).split('/engineering/')[0], 'engineering/release-management');
export const id = 'release/T724';
export const tests = ['release/CTL4'];
export const title = 'the judge is bound to nothing in its code: the command comes from the declaration, so another declared command is judged by that command, and the judge names no command, repository or scope itself';
export async function run() {
  const mod = await judge();
  assert.ok(mod, 'judge.mjs is absent');
  const other = { command: 'npm run verify' };
  assert.equal(mod.judgeSource({ directory, run: record({ command: 'npm run verify' }) }, other).result, 'verified');
  assert.deepEqual(mod.judgeSource({ directory, run: record() }, other).findings.map((f) => f.rule), ['source-command']);
  const source = readFileSync(join(RM, '05-src/publishing/verify-source/judge.mjs'), 'utf8');
  assert.ok(!/npm test|Kai-Hacks-AI|@kaihacksai/.test(source), 'the judge names a command, repository or scope');
  const declared = JSON.parse(readFileSync(join(RM, '05-src/publishing/verify-source/verify-source.json'), 'utf8'));
  assert.deepEqual(Object.keys(declared), ['command']);
  assert.equal(declared.command, 'npm test');
}
