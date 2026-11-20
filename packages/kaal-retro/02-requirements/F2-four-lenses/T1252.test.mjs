// Case retro/T1252 tests: retro/F2
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

export const id = 'retro/T1252';
export const tests = ['retro/F2'];
export const title = 'an address belongs to Lacked only and one subject lives in one entry, so the lenses cannot mirror each other';
export async function run() {
  const { judgeRetro } = await load('judge-retro.mjs');
  const longed = (subject, extra = '') => swap('None raised.', `- subject: ${subject}\n  worked-anyway: yes, nothing was slowed\n${extra}`);
  assert.equal(judgeRetro(retro(longed('a derived queue view'))).result, 'well-formed');
  assert.ok(problems(judgeRetro(retro(longed('a derived queue view', '  address: script\n')))).includes('Longed For:address-outside-lacked'), 'an address on Longed For passed');
  const learned = swap('  source: https://example.org/postmortem\n', '  source: https://example.org/postmortem\n  address: AGENTS.md\n');
  assert.ok(problems(judgeRetro(retro(learned))).includes('Learned:address-outside-lacked'), 'an address on Learned passed');
  const m = judgeRetro(retro(longed('Queue Rules')));
  assert.equal(m.result, 'malformed', 'one subject in two lenses passed');
  assert.ok(m.problems.some((p) => p.rule === 'subject-in-two-entries' && /queue rules/i.test(p.subject)), 'the repeated subject is not named');
  assert.equal(judgeRetro(retro(swap('- subject: the ACT wording', '- subject: queue rules'))).result, 'malformed', 'Liked and Lacked on one subject passed');
  assert.ok(problems(judgeRetro(retro(swap('  keeps:', '  verdict: good\n  keeps:')))).includes('Liked:unknown-field'), 'a field the lens does not take passed');
}
