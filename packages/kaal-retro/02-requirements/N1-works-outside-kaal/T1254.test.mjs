// Case retro/T1254 tests: retro/N1
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

export const id = 'retro/T1254';
export const tests = ['retro/N1'];
export const title = 'the scripts import only Node built-ins and files of their own folder';
export async function run() {
  assert.ok(existsSync(S), 'the scripts folder is absent');
  const files = readdirSync(S).filter((f) => f.endsWith('.mjs'));
  assert.ok(files.includes('find-retros.mjs') && files.includes('judge-retro.mjs'), 'the scripts are absent');
  const all = files.map((f) => readFileSync(join(S, f), 'utf8')).join('\n');
  for (const m of all.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) assert.ok(m[1].startsWith('node:') || m[1].startsWith('./'), `a script imports ${m[1]}`);
  assert.ok(!/@kaihacksai|\.kaal|\.github/.test(all), 'a script names a KAAL path');
}
