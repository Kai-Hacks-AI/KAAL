// Shared by the Cases of kaal-research: one well-formed rehearsal record, its evidence files, and a loader for the scripts.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const scriptsDir = join(repo, 'packages/kaal-research/skills/kaal-research/scripts');
export const load = async (name) => { const f = join(scriptsDir, name); assert.ok(existsSync(f), `${name} is absent`); return import(pathToFileURL(f).href); };
const sha = (c) => c.repeat(64);
const E = [['prompt', 'a'], ['answers', 'b'], ['scores', 'c']];
export const FILES = [...E.map(([r, c]) => ({ path: `evidence/${r}.txt`, sha256: sha(c) })), { path: 'evidence/r2.excerpt.txt', sha256: sha('9') }];
export const GOOD = `---
id: demo/RH1
kind: rehearsal
question: Does the guidance lead an agent to place persistence outside the candidate?
verdict: favourable
verdict-about: description
verdict-rests-on: c1
---
## Design
arms: bare, guided
untreated: bare
n: bare=2, guided=2
fresh-means: new session, no project memory, no project instructions, read-only tools
model: model-x
settings: default
blind: no
## Evidence
${E.map(([r, c]) => `- role: ${r}\n  path: evidence/${r}.txt\n  sha256: ${sha(c)}`).join('\n')}
- role: excerpt
  path: evidence/r2.excerpt.txt
  sha256: ${sha('9')}
## Runs
- run: r1
  arm: bare
  exposure: none
- run: r2
  arm: guided
  exposure: opened
  excerpt: evidence/r2.excerpt.txt
- run: r3
  arm: bare
  exposure: none
- run: r4
  arm: guided
  exposure: opened
  excerpt: evidence/r2.excerpt.txt
## Claims
- id: c1
  claim: guided agents placed the responsibilities they discussed correctly
  scope: description
  rests-on: r2, r4
  demonstrated: yes
- id: c2
  claim: the guidance caused the placement
  scope: effect
  rests-on: r1, r2, r3, r4
  demonstrated: no
  not-shown: unblinded, and no key was frozen before the guidance was fixed
## Limits
n-shows: two runs per arm show that a difference is visible or not, never a rate
`;
export const swap = (from, to, text = GOOD) => { assert.ok(text.includes(from), `fixture lacks: ${from}`); return text.replace(from, to); };
export const problems = (r) => r.problems.map((p) => `${p.section}:${p.rule}`);
export const judged = async (text, files = FILES) => (await load('judge-rehearsal.mjs')).judgeRehearsal(text, files);
// A record that is fit for an effect claim: untreated arm, blind scoring, key before treatment, treatment opened.
export const EFFECT = swap('demonstrated: no\n  not-shown: unblinded, and no key was frozen before the guidance was fixed', 'demonstrated: yes',
  swap('blind: no', 'blind: yes\nblind-how: scorer saw run labels only\nkey-frozen: 2026-11-20T10:00:00Z\ntreatment-fixed: 2026-11-20T11:00:00Z',
    swap('## Runs', '- role: key\n  path: evidence/key.txt\n  sha256: ' + 'd'.repeat(64) + '\n## Runs')));
export const EFFECT_FILES = [...FILES, { path: 'evidence/key.txt', sha256: 'd'.repeat(64) }];
