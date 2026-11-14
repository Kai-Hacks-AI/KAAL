// THROWAWAY PROTOTYPE CLI (skills/C1 PLAN evidence). Usage: node prototype.mjs <declaration.json> <fixtures.mjs> <repo-root> [--selftest]
import { readFileSync } from 'node:fs';
import { conforms, verdict } from './conforms.proto.mjs';

const [declPath, fixtures, root, flag] = process.argv.slice(2);
const decl = JSON.parse(readFileSync(declPath, 'utf8'));
const base = await conforms({ declaration: decl, root, fixtures });
const summary = verdict(base);
for (const [k, v] of Object.entries(base)) { console.log(`${k}  ${summary[k]}`); for (const x of v) console.log(`    ${x.status.padEnd(7)} ${x.mechanism ? x.mechanism + ': ' : ''}${x.detail}`); }
if (flag === '--selftest') {
  const mutants = [
    ['a value is listed under two outcomes (duplicates)', (d) => { d.mechanisms[0].outcome.clear.push('unknown'); }, 'F3'],
    ['undecidable input reads as clear (duplicates)', (d) => { const o = d.mechanisms[0].outcome; o.unknown = []; o.clear.push('unknown'); }, 'F3'],
    ['wrong export name (inventory)', (d) => { d.mechanisms[2].invoke.export = 'nope'; }, 'F2'],
    ['hook named in the declaration', (d) => { d.mechanisms[0].wire = '.githooks/pre-push'; }, 'F6'],
    ['judgment mechanism claims a gate outcome', (d) => { d.mechanisms[4].outcome = { at: 'x', clear: ['a'] }; }, 'F5'],
    ['non-clear result with no reason (report)', (d) => { d.mechanisms[1].reason = ['nothing[]']; }, 'F3'],
    ['judgment mechanism with no activation', (d) => { delete d.mechanisms[4].activation; }, 'F7'],
    ['reminder that does not name the Skill', (d) => { d.mechanisms[4].activation.reminder = 'Think carefully about tests before writing them.'; }, 'F7'],
    ['reminder longer than 280 characters', (d) => { d.mechanisms[4].activation.reminder += ' kaal-testing'.repeat(40); }, 'F7'],
    ['activation that claims a gate', (d) => { d.mechanisms[4].activation.gate = 'block'; }, 'F7'],
    ['owner differs from the ownership claim', (d) => { d.owner.id = '0'.repeat(64); }, 'F1'],
  ];
  console.log('\nSELFTEST: each mutant of the draft must fail the named requirement');
  for (const [label, mutate, req] of mutants) {
    const d = JSON.parse(JSON.stringify(decl)); mutate(d);
    console.log(`  ${verdict(await conforms({ declaration: d, root, fixtures }))[req] === 'FAIL' ? 'CAUGHT' : 'MISSED'}  ${req}  ${label}`);
  }
}
