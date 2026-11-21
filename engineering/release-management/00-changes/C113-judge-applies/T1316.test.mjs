// Case release/T1316 tests: release/F88, release/A78
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const PHASE = join(RM, '05-src/phase');
const use = (name) => { const f = join(PHASE, name); assert.ok(existsSync(f), `${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1316';
export const tests = ['release/F88', 'release/A78'];
export const title = 'the answer of a judge is well formed: Given a verdict and an applies, When an answer is made, Then only PASS, FAIL or UNKNOWN with a boolean applies is accepted, applies false only on a PASS, and only a PASS that applies is judged and fine';
export async function run() {
  const { answer, pass, fail, unknown, judgedAndFine } = await use('lib/result.mjs');
  // Given the three kinds, Then each carries the verdict, the flag and the message, and the rest the judge adds.
  assert.deepEqual(pass('nothing to judge', { applies: false, due: [] }), { due: [], verdict: 'PASS', applies: false, message: 'nothing to judge' });
  assert.deepEqual(pass('judged', { applies: true }), { verdict: 'PASS', applies: true, message: 'judged' });
  assert.deepEqual(fail('a fault', { outside: ['x'] }), { outside: ['x'], verdict: 'FAIL', applies: true, message: 'a fault' });
  assert.deepEqual(unknown('cannot tell'), { verdict: 'UNKNOWN', applies: true, message: 'cannot tell' });
  // Given something that is not an answer, Then it is refused.
  assert.throws(() => answer('MAYBE', true, 'm'), /not a verdict/);
  for (const bad of [undefined, null, 'true', 1, 0]) assert.throws(() => answer('PASS', bad, 'm'), /applies must be true or false/);
  assert.throws(() => answer('FAIL', false, 'm'), /always applies/);
  assert.throws(() => answer('UNKNOWN', false, 'm'), /always applies/);
  assert.throws(() => pass('m', {}), /applies must be true or false/);
  // Only a PASS that applies is judged and fine; nothing else, and nothing malformed, is.
  assert.equal(judgedAndFine(pass('m', { applies: true })), true);
  assert.equal(judgedAndFine(pass('m', { applies: false })), false, 'a PASS with nothing to judge is not judged and fine');
  assert.equal(judgedAndFine(fail('m')), false);
  assert.equal(judgedAndFine(unknown('m')), false, 'UNKNOWN never passes');
  for (const bad of [undefined, null, {}, { verdict: 'PASS' }, { verdict: 'PASS', applies: 'true' }]) assert.equal(judgedAndFine(bad), false);
}
