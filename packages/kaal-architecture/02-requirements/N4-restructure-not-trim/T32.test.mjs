// Case architecture/T32 tests: architecture/N4
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dir, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T32';
export const tests = ['architecture/N4'];
export const title = 'the Skill, read as an agent reads it (the router and its references together), still states each family of rule it stated before it was restructured; whether the meaning is kept is reviewed against the mapping of the DO';
// A family is a rule seen by its concepts: all of them must meet in one paragraph of the Skill, in any wording and any order.
const FAMILIES = {
  'scope is the target state of a plateau, and travel between plateaus belongs elsewhere': [/target state/i, /plateau/i, /other capabilit|outside/i],
  'Solution and Delivery are the two concerns, told apart by what each is': [/Solution/, /Delivery/, /means/i],
  'the test: would it hold if the means were replaced': [/replaced/i, /means/i],
  'judge by the concern a part constrains': [/constrain/i, /not by/i],
  'a mixed statement is split': [/mixed/i, /split/i],
  'a constraint across the line stays with the concern it constrains, and acceptance is asked when unknown': [/constrain/i, /Delivery/, /Solution/, /accepted|accept/i],
  'an ambiguous statement is put to the author, never guessed': [/ambiguous/i, /author|question/i, /guess/i],
  'the questions are raised before design proceeds': [/before design proceeds/i],
  'the report gives parts, a finding and a next move': [/finding/i, /keep/i, /split/i, /ask/i],
  'there is no third concern': [/third concern/i],
  'the Skill names no organization, domain or technology': [/organization/i, /domain/i, /technology/i],
};
export function run() {
  const refs = join(dir, 'skills/kaal-architecture/references');
  const files = [join(dir, SKILL)];
  if (existsSync(refs)) for (const f of readdirSync(refs).sort()) if (f.endsWith('.md')) files.push(join(refs, f));
  const paragraphs = files.flatMap((f) => readFileSync(f, 'utf8').split(/\r?\n\s*\r?\n/));
  for (const [family, concepts] of Object.entries(FAMILIES)) {
    assert.ok(paragraphs.some((p) => concepts.every((c) => c.test(p))), `the Skill no longer states: ${family}`);
  }
}
