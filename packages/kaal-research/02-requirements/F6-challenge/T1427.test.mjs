// Case research/T1427 tests: research/F6
import assert from 'node:assert/strict';
import { GOOD, judged, load, problems, swap } from '../fixture.mjs';
export const id = 'research/T1427';
export const tests = ['research/F6'];
export const title = 'a record may challenge another with an outcome and what differs, a plain rerun may say none differs, the finder lists what each record challenges, and the judgement looks nothing up';
export async function run() {
  const refused = async (rule, text) => assert.ok(problems(await judged(text)).includes(rule), `${rule}: not refused`);
  const challenge = (extra = 'challenges: demo/RH1\noutcome: differs\ndiffers-in: agent, harness') => swap('id: demo/RH1', `id: demo/RH2\n${extra}`);
  const ok = await judged(challenge());
  assert.equal(ok.result, 'well-formed', `a challenge is refused: ${problems(ok)}`);
  assert.equal((await judged(challenge('challenges: demo/RH1\noutcome: replicates\ndiffers-in: none'))).result, 'well-formed', 'a plain rerun is refused');
  assert.equal((await judged(challenge('challenges: other/RH7\noutcome: inconclusive\ndiffers-in: model'))).result, 'well-formed', 'the challenged record was looked up');
  await refused('front:challenges', challenge('challenges: demo/R1\noutcome: differs\ndiffers-in: agent'));
  await refused('front:challenges-self', challenge('challenges: demo/RH2\noutcome: differs\ndiffers-in: agent'));
  await refused('front:outcome', challenge('challenges: demo/RH1\ndiffers-in: agent'));
  await refused('front:outcome', challenge('challenges: demo/RH1\noutcome: confirmed\ndiffers-in: agent'));
  await refused('front:differs-in', challenge('challenges: demo/RH1\noutcome: differs'));
  await refused('front:outcome-without-challenge', swap('id: demo/RH1', 'id: demo/RH1\noutcome: replicates'));
  await refused('front:outcome-without-challenge', swap('id: demo/RH1', 'id: demo/RH1\ndiffers-in: agent'));
  const { findRehearsals } = await load('find-rehearsals.mjs');
  const r = findRehearsals([{ path: 'a/RH1.md', text: GOOD }, { path: 'a/RH2.md', text: challenge() }]);
  assert.deepEqual(r.rehearsals.map((x) => [x.id, x.challenges ?? null]), [['demo/RH1', null], ['demo/RH2', 'demo/RH1']]);
}
