// Case testing/T423 tests: testing/F177
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/revision.mjs')), 'lib/revision.mjs is absent');

const HEAD = 'd836d936'.padEnd(40, '1'); // the head of a pull request
const MERGE = 'd4751363'.padEnd(40, '2'); // the test merge commit of a pull_request run (GITHUB_SHA)
const kinds = (r) => r.findings.map((f) => f.kind);

export const id = 'testing/T423';
export const tests = ['testing/F177'];
export const title = 'testing/F177 checkRevision accepts the judged revision, names the trigger when it was recorded instead, and refuses a short or missing id';

export async function run() {
  need();
  const { checkRevision } = await import(pathToFileURL(join(pkg, 'lib/revision.mjs')).href);

  const same = checkRevision({ recorded: HEAD, judged: HEAD, trigger: MERGE });
  assert.equal(same.ok, true, 'the recorded id is the judged one');
  assert.deepEqual(same.findings, []);
  assert.equal(checkRevision({ recorded: HEAD.toUpperCase(), judged: HEAD }).ok, true, 'letter case does not make two ids differ');
  assert.equal(checkRevision({ recorded: HEAD, judged: HEAD, trigger: HEAD }).ok, true, 'on a push the three are one id');
  assert.equal(checkRevision({ recorded: 'a'.repeat(64), judged: 'a'.repeat(64) }).ok, true, 'a 64 character id is a revision');

  const d20 = checkRevision({ recorded: MERGE, judged: HEAD, trigger: MERGE });
  assert.equal(d20.ok, false);
  assert.deepEqual(kinds(d20), ['recorded-is-trigger'], 'release/D20: the merge commit of the run was recorded as the revision');
  assert.ok(d20.findings.every((f) => typeof f.detail === 'string' && f.detail.length > 0), 'a finding says what is wrong');

  assert.deepEqual(kinds(checkRevision({ recorded: MERGE, judged: HEAD })), ['recorded-not-judged'], 'without a trigger a mismatch is still named');
  assert.deepEqual(kinds(checkRevision({ recorded: 'e'.repeat(40), judged: HEAD, trigger: MERGE })), ['recorded-not-judged'], 'another id than the trigger is not the trigger');

  assert.deepEqual(kinds(checkRevision({ recorded: HEAD, judged: 'd836d93' })), ['judged-not-a-revision'], 'an abbreviation is not a revision');
  assert.deepEqual(kinds(checkRevision({ recorded: 'd836d93', judged: HEAD })), ['recorded-not-a-revision']);
  assert.deepEqual(kinds(checkRevision({ recorded: 'z'.repeat(40), judged: HEAD })), ['recorded-not-a-revision'], 'not hexadecimal');
  assert.deepEqual(kinds(checkRevision({})), ['judged-not-a-revision', 'recorded-not-a-revision'], 'nothing given: both are named, the judged one first');
  assert.equal(checkRevision({ recorded: 'abc', judged: 'abc' }).ok, false, 'two equal abbreviations are not evidence of a revision');

  const input = Object.freeze({ recorded: MERGE, judged: HEAD, trigger: MERGE });
  assert.doesNotThrow(() => checkRevision(input), 'a frozen input is not written to');
}
