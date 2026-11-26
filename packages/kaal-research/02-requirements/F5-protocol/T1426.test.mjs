// Case research/T1426 tests: research/F5
import assert from 'node:assert/strict';
import { GOOD, judged, problems, swap } from '../fixture.mjs';
export const id = 'research/T1426';
export const tests = ['research/F5'];
export const title = 'a record names its harness and states a protocol (materials with the prompt, run, score, confirms, refutes) that a reader with another setup could follow, and the materials are in its evidence';
export async function run() {
  const refused = async (rule, text) => assert.ok(problems(await judged(text)).includes(rule), `${rule}: not refused`);
  const ok = await judged(GOOD);
  assert.equal(ok.result, 'well-formed', `a full protocol is refused: ${problems(ok)}`);
  assert.ok(ok.says.length > 0, 'the result does not say it is form only');
  await refused('Design:harness', swap(/harness: .*\n/.exec(GOOD)[0], ''));
  await refused('Protocol:missing', GOOD.replace(/## Protocol[\s\S]*$/, ''));
  const inProtocol = (line, to) => { const [head, tail] = GOOD.split('## Protocol'); return `${head}## Protocol${tail.replace(new RegExp(`${line}: .*\\n`), to)}`; };
  for (const line of ['materials', 'run', 'score', 'confirms', 'refutes']) {
    await refused(`Protocol:${line}`, inProtocol(line, ''));
    await refused(`Protocol:${line}`, inProtocol(line, `${line}: \n`));
  }
  await refused('Protocol:materials-not-evidence', swap('materials: evidence/prompt.txt, evidence/scores.txt', 'materials: evidence/prompt.txt, evidence/elsewhere.txt'));
  await refused('Protocol:materials-prompt', swap('materials: evidence/prompt.txt, evidence/scores.txt', 'materials: evidence/scores.txt'));
}
