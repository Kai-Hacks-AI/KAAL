// Case controls/T1099 tests: controls/F31
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

export const id = 'controls/T1099';
export const tests = ['controls/F31'];
export const title = 'the reviews of a control are read from review records by its id, each saying its coverage of the Intents and Cases of the control, apart from what it found';
export async function run() {
  const m = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  assert.equal(typeof m.readSubjects, 'function', 'readSubjects is not exported');
  assert.equal(typeof m.reviewsOf, 'function', 'reviewsOf is not exported');
  const dir = mkdtempSync(join(tmpdir(), 'r-'));
  app(dir, 'whole', subj());
  app(dir, 'short', subj({ reference: { label: 'x', reads: 'y', items: ['demo/I1'] }, actual: { label: 'x', reads: 'y', items: ['demo/T1'] } }));
  mkdirSync(join(dir, 'no-subject'));
  writeFileSync(join(dir, 'no-subject', 'review.md'), '# a review without a subject.json\n');
  const subjects = m.readSubjects(dir);
  assert.equal(subjects.length, 2, 'a folder without subject.json was read as a review, or a review was missed');
  const c = await ctl();
  const r = m.reviewsOf(c, subjects);
  assert.equal(r.length, 2, 'the reviews of the control were not found');
  const whole = r.find((x) => x.path.includes('whole'));
  const short = r.find((x) => x.path.includes('short'));
  assert.equal(whole.coverage, 'complete', 'a review that named every Intent and Case was not complete');
  assert.equal(short.coverage, 'partial', 'a review that skipped an Intent and a Case was complete');
  assert.deepEqual(short.missing.sort(), ['demo/I2', 'demo/T2'], 'the missing Intent and Case were not named');
}
