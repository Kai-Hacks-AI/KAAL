// Case retro/T1253 tests: retro/F3
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-retro/skills/kaal-retro/scripts');
const load = async (n) => { const f = join(S, n); assert.ok(existsSync(f), `${n} is absent`); return import(pathToFileURL(f).href); };
const front = (o = {}) => { const f = { id: 'demo/RT1', format: '4L', reflects: '[demo/C1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n'; };
const GOOD = `# retro
## Liked
- subject: the ACT wording
  keeps: the agent seat is stated
## Learned
- subject: postmortems ask where we got lucky
  source: https://example.org/postmortem
## Lacked
- subject: queue rules
  decision-point: a new PROMOTION arrived
  cost: I synced every one and was corrected
  findable: no
  address: AGENTS.md
## Longed For
None raised.
`;
const retro = (body = GOOD, o) => front(o) + body;
const swap = (from, to) => GOOD.replace(from, to);
const problems = (r) => r.problems.map((p) => `${p.section}:${p.rule}`);

export const id = 'retro/T1253';
export const tests = ['retro/F3'];
export const title = 'the judgement is form only: it passes a well-formed retro that is false, and does not judge a format it does not know';
export async function run() {
  const { judgeRetro } = await load('judge-retro.mjs');
  const wrong = swap('cost: I synced every one and was corrected', 'cost: none, everything was fine and the sky is green');
  assert.equal(judgeRetro(retro(wrong)).result, 'well-formed', 'the judgement ruled on truth');
  assert.equal(judgeRetro(retro(GOOD, { format: 'sailboat' })).result, 'unjudged', 'an unknown format was judged');
  const r = judgeRetro(retro(GOOD, { format: 'sailboat' }));
  assert.notEqual(r.result, 'well-formed');
  const { findRetros } = await load('find-retros.mjs');
  assert.equal(findRetros([{ path: 'a/RT1.md', text: retro(GOOD, { format: 'sailboat' }) }]).retros[0].format, 'sailboat', 'the finder dropped a retro of another format');
}
