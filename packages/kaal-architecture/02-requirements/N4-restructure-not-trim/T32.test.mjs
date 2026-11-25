// Case architecture/T32 tests: architecture/N4
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dir, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T32';
export const tests = ['architecture/N4'];
export const title = 'the Skill, read as an agent reads it (the router and its references together), still holds every rule it held before it was restructured';
const RULES = [
  'Architecture describes the target state of a plateau, whether final or intermediate.',
  'It prescribes no notation, tool or procedure',
  'Judge by the concern each part constrains, not by its wording or by where it is written.',
  'split it into one statement for each. Do not file the whole under its dominant part.',
  'A Delivery constraint that limits what the solution can offer stays Delivery',
  'a Solution constraint that restricts the choice of means stays Solution',
  'If the limitation is independently accepted as a requirement of the solution, state it explicitly as its own Solution statement.',
  'If the statement does not say whether it is accepted, ask.',
  'name the two readings and put the question to the author. Do not guess, and do not pick the reading that is easier to classify.',
  'Raise each of these before design proceeds, and say what you would need to know to settle it.',
  'Its parts, each marked Solution or Delivery.',
  'Your finding: none, mixed or ambiguous.',
  'The next move: keep, split or ask.',
  'Keep the report short. A clean statement needs one line.',
  'How to travel from one plateau to the next, and how finished work is brought together and delivered, belong to other capabilities.',
  'If a statement is only about such travel, say that it is outside the target state and leave it there.',
  'Classify by the concern each part constrains, not by who wrote it or how firmly.',
  'Never guess an ambiguous term.',
  'Do not invent a third concern.',
  'Keep examples and wording of your own report free of any one organization, domain or technology.',
];
export function run() {
  const refs = join(dir, 'skills/kaal-architecture/references');
  const parts = [readFileSync(join(dir, SKILL), 'utf8')];
  if (existsSync(refs)) for (const f of readdirSync(refs).sort()) if (f.endsWith('.md')) parts.push(readFileSync(join(refs, f), 'utf8'));
  const text = parts.join('\n').replace(/\s+/g, ' ');
  for (const rule of RULES) assert.ok(text.includes(rule), `the Skill lost: ${rule}`);
}
