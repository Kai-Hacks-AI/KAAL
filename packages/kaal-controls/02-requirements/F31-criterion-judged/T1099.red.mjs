// Case controls/T1099 tests: controls/F31
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const good = { control: 'demo/CTL1', verdict: 'partly', reason: 'The Case refuses an impure SYNC but never a pure one.', by: 'reviewer', ref: 'abc123', of: 'd1' };

export const id = 'controls/T1099';
export const tests = ['controls/F31'];
export const title = 'a judgement is read only in its shape, and run records never read a judgement file';
export async function run() {
  const m = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  assert.equal(typeof m.readJudgements, 'function', 'readJudgements is not exported');
  const dir = mkdtempSync(join(tmpdir(), 'j-'));
  writeFileSync(join(dir, '1.judgement.json'), JSON.stringify(good));
  writeFileSync(join(dir, '2.judgement.json'), JSON.stringify({ ...good, verdict: 'fine' }));
  writeFileSync(join(dir, '3.judgement.json'), JSON.stringify({ ...good, reason: '' }));
  writeFileSync(join(dir, '1.json'), JSON.stringify([{ case: 'demo/T1', x: 'fixture', run: 1, outcome: 'GREEN' }]));
  const r = m.readJudgements(dir);
  assert.equal(r.judgements.length, 1, 'a judgement of the wrong shape was read');
  assert.equal(r.judgements[0].verdict, 'partly', 'the valid judgement was not read');
  assert.equal(r.problems.length, 2, 'the two bad judgements were not listed as problems');
  for (const v of ['covered', 'partly', 'not-covered', 'unresolved']) writeFileSync(join(dir, `v-${v}.judgement.json`), JSON.stringify({ ...good, verdict: v }));
  assert.equal(m.readJudgements(dir).judgements.length, 5, 'a verdict of the four was refused');
  const recs = m.readRecords(dir);
  assert.equal(recs.length, 1, 'run records read a judgement file');
  assert.equal(recs[0].case, 'demo/T1', 'the run record was not read');
}
