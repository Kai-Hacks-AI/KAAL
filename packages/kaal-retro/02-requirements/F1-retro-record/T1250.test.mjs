// Case retro/T1250 tests: retro/F1
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

export const id = 'retro/T1250';
export const tests = ['retro/F1'];
export const title = 'the finder lists retros with id, format and reflects and refuses what does not fit, without searching a folder';
export async function run() {
  const { findRetros } = await load('find-retros.mjs');
  const r = findRetros([{ path: 'a/RT1.md', text: retro() }, { path: 'a/other.md', text: '# not a retro\n' }]);
  assert.deepEqual(r.retros.map((x) => [x.id, x.format, x.reflects]), [['demo/RT1', '4L', ['demo/C1']]]);
  assert.equal(r.refused.length, 0, 'a file that is not a retro was refused');
  for (const [why, text] of [['id pattern', retro(GOOD, { id: 'demo/4L.1' })], ['no format', retro(GOOD, { format: undefined })], ['empty reflects', retro(GOOD, { reflects: '[]' })], ['reflects not a list', retro(GOOD, { reflects: 'demo/C1' })], ['reflects not a Change id', retro(GOOD, { reflects: '[nonsense]' })]]) {
    const x = findRetros([{ path: 'a/RT1.md', text }]);
    assert.equal(x.retros.length, 0, `${why}: listed as a retro`);
    assert.equal(x.refused.length, 1, `${why}: not refused`);
    assert.ok(x.refused[0].reason, `${why}: no reason`);
  }
  const d = findRetros([{ path: 'a/RT1.md', text: retro() }, { path: 'b/RT1.md', text: retro() }]);
  assert.equal(d.retros.length, 0, 'a duplicated id was listed');
  assert.equal(d.refused.length, 2);
}
