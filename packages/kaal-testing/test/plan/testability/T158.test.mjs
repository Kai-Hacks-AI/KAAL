// Case testing/T158 tests: testing/F131
import assert from 'node:assert/strict';
import { HEADING, answerProblems, doRuns, readJson, readText, sha, skillParts } from './lib.mjs';
import { join } from 'node:path';
export const id = 'testing/T158';
export const tests = ['testing/F131'];
export const title = 'the trial records of the installed section are raw, hashed and well-formed, and the Skill arm was given the section as installed';
export function run() {
  const runs = doRuns();
  const { section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  const key = readJson(join(runs[0]?.dir ?? '', '../key.json'));
  const ids = key.key.map((k) => k.id);
  assert.ok(ids.length >= 3, 'the key names at least three claims');
  for (const arm of ['baseline', 'skill']) assert.ok(runs.filter((r) => r.arm === arm).length >= 2, `at least two runs of the ${arm} arm`);
  for (const { run, arm, dir } of runs) {
    const at = `${run}/${arm}`;
    const rec = readJson(join(dir, `${arm}.json`));
    const prompt = readText(join(dir, `${arm}.prompt.txt`));
    const raw = readText(join(dir, `${arm}.raw.txt`));
    assert.notEqual(rec.observer, rec.author, `${at}: the observer is not the author`);
    assert.ok(/subagent|fresh/i.test(rec.observer ?? ''), `${at}: the observer is a fresh agent`);
    assert.equal(rec.promptSha256, sha(prompt), `${at}: the prompt hash is the prompt's`);
    assert.deepEqual(rec.answers, JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')), `${at}: the answers are the raw output, unedited`);
    assert.equal(prompt.includes(section), arm === 'skill', `${at}: the section as installed is in the prompt of the Skill arm only`);
    assert.deepEqual(rec.answers.map((a) => a.id), ids, `${at}: one answer for each claim of the key, in order`);
    for (const a of rec.answers) assert.deepEqual(answerProblems(a), [], `${at} ${a.id}`);
  }
}
