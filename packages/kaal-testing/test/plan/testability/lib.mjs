// Helpers for the testing/C59 planned Cases. Read-only: they read the repository and nothing else.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const SKILL = join(PKG, 'skills/kaal-testing/SKILL.md');
export const PLAN = join(PKG, 'plan/testability');
export const DO_TRIAL = join(PLAN, 'trial/do');
export const HEADING = 'Assessing a test against its claim';
export const APPROACHES = ['deterministic', 'judgment', 'pushback'];
export const OWNERS = ['Intent', 'Requirements', 'Architecture', 'Defect'];
export const sha = (text) => createHash('sha256').update(text).digest('hex');
export const readText = (p) => {
  assert.ok(existsSync(p), `missing: ${p.slice(PKG.length + 1)}`);
  return readFileSync(p, 'utf8');
};
export const readJson = (p) => JSON.parse(readText(p));

/** The `## ` headings of the Skill in order, and the body of the testability section ('' when absent). */
export function skillParts() {
  const text = readText(SKILL);
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const at = text.search(new RegExp(`^## ${HEADING}\\s*$`, 'm'));
  if (at < 0) return { text, headings, section: '' };
  const rest = text.slice(at);
  const next = rest.slice(3).search(/^## /m);
  return { text, headings, section: (next < 0 ? rest : rest.slice(0, next + 3)).trimEnd() };
}

/** The trial's runs: [{ run, arm, dir }] for each run folder holding a record of an arm. */
export function doRuns() {
  assert.ok(existsSync(DO_TRIAL), 'missing: plan/testability/trial/do (the DO trial records)');
  const runs = [];
  for (const d of readdirSync(DO_TRIAL).filter((n) => /^run\d+$/.test(n)).sort())
    for (const arm of ['baseline', 'skill']) runs.push({ run: d, arm, dir: join(DO_TRIAL, d) });
  return runs;
}

/** What each approach must carry. Returns the problems with one answer. */
export function answerProblems(a) {
  const p = [];
  const filled = (v) => typeof v === 'string' && v.trim() !== '';
  if (!APPROACHES.includes(a.approach)) p.push(`approach "${a.approach}" is none of ${APPROACHES.join(', ')}`);
  if (!filled(a.why)) p.push('no why');
  if (!Array.isArray(a.unresolved)) p.push('unresolved is not a list');
  const need = { deterministic: ['observable', 'oracle'], judgment: ['evidence', 'judge'], pushback: ['owner', 'question'] }[a.approach] ?? [];
  for (const f of need) if (!filled(a[f])) p.push(`${a.approach} without ${f}`);
  for (const f of ['observable', 'oracle', 'evidence', 'judge', 'owner', 'question'])
    if (!need.includes(f) && a[f] != null) p.push(`${a.approach} carries ${f}`);
  if (a.approach === 'pushback' && !OWNERS.some((o) => a.owner?.includes(o))) p.push(`pushback owner "${a.owner}" names none of ${OWNERS.join(', ')}`);
  return p;
}
