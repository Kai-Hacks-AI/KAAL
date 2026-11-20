// Case retro/T1255 tests: retro/F6
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

export const id = 'retro/T1255';
export const tests = ['retro/F6'];
export const title = 'a retro opens with a non-empty Account of line, whatever it says, and the judgement names a missing or empty one';
export async function run() {
  const { judgeRetro } = await load('judge-retro.mjs');
  const open = (line) => front() + (line === undefined ? '' : line + '\n') + GOOD;
  for (const line of ['Account of: I am the release thread, and I did the DO of C103.', 'Account of: x', 'Account of: 🙂 anything at all, in any words']) assert.equal(judgeRetro(open(line)).result, 'well-formed', `${line} was refused`);
  for (const [why, text] of [['absent', open()], ['empty', open('Account of:')], ['blank', open('Account of:   ')], ['not first', front() + GOOD.replace('## Liked', 'Account of: I did it.\n## Liked')], ['after the lenses', open() + 'Account of: I did it.\n']]) {
    const r = judgeRetro(text);
    assert.equal(r.result, 'malformed', `${why}: passed`);
    assert.ok(r.problems.some((p) => p.rule === 'account-of'), `${why}: the rule is not named`);
  }
}
