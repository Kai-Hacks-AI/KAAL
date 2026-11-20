// Case retro/T1251 tests: retro/F2
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-retro/skills/kaal-retro/scripts');
const load = async (n) => { const f = join(S, n); assert.ok(existsSync(f), `${n} is absent`); return import(pathToFileURL(f).href); };
const front = (o = {}) => { const f = { id: 'demo/RT1', format: '4L', reflects: '[demo/C1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\nAccount of: I am a test agent.\n'; };
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

export const id = 'retro/T1251';
export const tests = ['retro/F2'];
export const title = 'the judgement accepts a retro whose sections and entry fields fit its lenses and names the rule a malformed one breaks';
const SRC = '  source: https://example.org/postmortem\n';
export async function run() {
  const { judgeRetro } = await load('judge-retro.mjs');
  const has = (body, rule) => assert.ok(problems(judgeRetro(retro(body))).includes(rule), `${rule} not named`);
  assert.equal(judgeRetro(retro()).result, 'well-formed', 'a fitting retro is not well-formed');
  for (const f of ['decision-point', 'cost', 'findable', 'address']) {
    const r = judgeRetro(retro(GOOD.replace(new RegExp(`  ${f}:.*\n`), '')));
    assert.equal(r.result, 'malformed', `Lacked without ${f} passed`);
    assert.ok(problems(r).includes(`Lacked:missing-${f}`));
  }
  has(swap('findable: no', 'findable: maybe'), 'Lacked:findable-yes-or-no');
  has(swap(SRC, ''), 'Learned:missing-source');
  assert.equal(judgeRetro(retro(swap(SRC, '  searched: postmortem practice; found nothing\n'))).result, 'well-formed', 'a recorded empty search was refused');
  has(GOOD.replace(/## Learned\n[\s\S]*?## Lacked/, '## Learned\nNone raised.\n## Lacked'), 'Learned:may-not-be-empty');
  has(swap('  keeps: the agent seat is stated\n', ''), 'Liked:missing-keeps');
  has(swap('None raised.', '- subject: a dashboard\n'), 'Longed For:missing-worked-anyway');
  const order = GOOD.replace('## Liked', '## TMP').replace('## Lacked', '## Liked').replace('## TMP', '## Lacked');
  assert.equal(judgeRetro(retro(order)).result, 'malformed', 'sections out of order passed');
}
