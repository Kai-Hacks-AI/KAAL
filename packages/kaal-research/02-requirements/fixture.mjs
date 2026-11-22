// Shared by the Cases of kaal-research: one well-formed rehearsal record, its evidence files, and a loader for the scripts.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const scriptsDir = join(repo, 'packages/kaal-research/skills/kaal-research/scripts');
export const load = async (name) => { const f = join(scriptsDir, name); assert.ok(existsSync(f), `${name} is absent`); return import(pathToFileURL(f).href); };
const sha = (c) => c.repeat(64);
export const ROLES = ['prompt', 'subject', 'key', 'rubric', 'answers', 'scores'];
export const FILES = [...ROLES.map((r, i) => ({ path: `evidence/${r}.txt`, sha256: sha('abcdef'[i]) })), { path: 'evidence/r2.excerpt.txt', sha256: sha('9') }];
export const GOOD = `---
id: demo/RH1
kind: rehearsal
question: Does the guidance lead an agent to place persistence outside the candidate?
verdict: inconclusive
---
## Design
arms: none, guided
untreated: none
n: none=2, guided=2
fresh-means: new session, no project memory, no project instructions, read-only tools
isolation-checked: yes
model: model-x
settings: default
blind: yes
blind-how: scorer saw run labels r1 to r4 only; the arm map was held by the runner
key-frozen: 2026-11-20T10:00:00Z
treatment-fixed: 2026-11-20T11:00:00Z
## Evidence
${ROLES.map((r, i) => `- role: ${r}\n  path: evidence/${r}.txt\n  sha256: ${sha('abcdef'[i])}`).join('\n')}
- role: excerpt
  path: evidence/r2.excerpt.txt
  sha256: ${sha('9')}
## Runs
- run: r1
  arm: none
  exposure: none
- run: r2
  arm: guided
  exposure: opened
  excerpt: evidence/r2.excerpt.txt
- run: r3
  arm: none
  exposure: none
- run: r4
  arm: guided
  exposure: opened
  excerpt: evidence/r2.excerpt.txt
## Claims
- claim: guided agents placed responsibilities they discussed correctly
  rests-on: r2, r4
  demonstrated: yes
- claim: guided agents placed persistence
  rests-on: r2, r4
  demonstrated: no
  not-shown: persistence was not asked end to end
## Limits
n-shows: two runs per arm show that a difference is visible or not, never a rate
`;
export const swap = (from, to, text = GOOD) => { assert.ok(text.includes(from), `fixture lacks: ${from}`); return text.replace(from, to); };
export const problems = (r) => r.problems.map((p) => `${p.section}:${p.rule}`);
export const judged = async (text, files = FILES) => (await load('judge-rehearsal.mjs')).judgeRehearsal(text, files);
