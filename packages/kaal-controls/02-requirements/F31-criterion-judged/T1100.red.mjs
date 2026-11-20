// Case controls/T1100 tests: controls/F31
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = '---\nid: demo/CTL1\ntitle: approve Sync\ndescription: A SYNC is approved when it is pure.\ntype: preventive\nstatus: running\nhas: [demo/I1, demo/I2]\n---\n# demo/CTL1\n';
const ctl = async () => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item }, { path: 'x/T1.test.mjs', text: '// Case demo/T1 tests: demo/CTL1\n' }, { path: 'x/T2.test.mjs', text: '// Case demo/T2 tests: demo/CTL1\n' }]).controls[0]; };
const app = (dir, name, subject) => { mkdirSync(join(dir, name), { recursive: true }); writeFileSync(join(dir, name, 'subject.json'), JSON.stringify(subject)); };
const subj = (o = {}) => ({ focus: 'control', subject: 'demo/CTL1', reference: { label: 'the Intents and the criterion', reads: 'at abc', items: ['demo/I1', 'demo/I2'] }, actual: { label: 'the Cases', reads: 'at abc', items: ['demo/T1', 'demo/T2'] }, inspected: [], questions: [], ...o });

export const id = 'controls/T1100';
export const tests = ['controls/F31'];
export const title = 'a review of another subject or focus is not a review of the control, no review is none, and a review changes no verdict';
export async function run() {
  const m = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  assert.equal(typeof m.reviewsOf, 'function', 'reviewsOf is not exported');
  const dir = mkdtempSync(join(tmpdir(), 'r-'));
  app(dir, 'other-control', subj({ subject: 'demo/CTL2' }));
  app(dir, 'a-promotion', subj({ focus: 'promotion' }));
  const c = await ctl();
  assert.deepEqual(m.reviewsOf(c, m.readSubjects(dir)), [], 'a review of another subject or focus was returned');
  assert.deepEqual(m.reviewsOf(c, []), [], 'no review was not an empty list');
  app(dir, 'mine', subj());
  const before = m.judgeEvidence({ ...c, evidence: [{ kind: 'fixture', runs: 1, fail: false }] }, []);
  assert.equal(m.reviewsOf(c, m.readSubjects(dir)).length, 1, 'the review of the control was not found');
  const after = m.judgeEvidence({ ...c, evidence: [{ kind: 'fixture', runs: 1, fail: false }] }, []);
  assert.deepEqual(after, before, 'a review changed a verdict');
  assert.equal(after.verdict, 'UNKNOWN', 'a verdict was not UNKNOWN without records');
}
