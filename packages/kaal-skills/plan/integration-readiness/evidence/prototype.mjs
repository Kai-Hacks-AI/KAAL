// THROWAWAY PROTOTYPE CLI (skills/C1 PLAN evidence). Usage: node prototype.mjs <declaration.json> <fixtures.mjs> <repo-root> [--selftest]
import { readFileSync } from 'node:fs';
import { conforms, verdict } from './conforms.proto.mjs';

const [declPath, fixtures, root, flag] = process.argv.slice(2);
const decl = JSON.parse(readFileSync(declPath, 'utf8'));
const base = await conforms({ declaration: decl, root, fixtures });
const summary = verdict(base);
for (const [k, v] of Object.entries(base)) { console.log(`${k}  ${summary[k]}`); for (const x of v) console.log(`    ${x.status.padEnd(7)} ${x.mechanism ? x.mechanism + ': ' : ''}${x.detail}`); }
if (flag === '--selftest') {
  const arch = decl.owner.name === 'Architecture';
  const mutants = arch ? [
    ['a static reminder in the declaration, no invocable mechanism', (d) => { d.mechanisms[0].activation.reminder = 'Read kaal-architecture, The test.'; }, 'F7'],
    ['activation names a mechanism that is not declared', (d) => { d.mechanisms[0].activation.invoke = 'nope'; }, 'F7'],
    ['activation names a mechanism that is not a remind', (d) => { d.mechanisms[1].kind = 'measure'; }, 'F7'],
    ['the remind mechanism claims an outcome', (d) => { d.mechanisms[1].outcome = { at: 'exit', clear: [0] }; }, 'F7'],
    ['no situation', (d) => { d.mechanisms[0].activation.when = ''; }, 'F7'],
    ['the activation claims a gate', (d) => { d.mechanisms[0].activation.gate = 'block'; }, 'F7'],
    ['the remind command does not exist', (d) => { d.mechanisms[1].invoke.command[1] = 'scripts/nope.mjs'; }, 'F1'],
  ] : [
    ['a value is listed under two outcomes (duplicates)', (d) => { d.mechanisms[0].outcome.clear.push('unknown'); }, 'F3'],
    ['undecidable input reads as clear (duplicates)', (d) => { const o = d.mechanisms[0].outcome; o.unknown = []; o.clear.push('unknown'); }, 'F3'],
    ['wrong export name (inventory)', (d) => { d.mechanisms[2].invoke.export = 'nope'; }, 'F2'],
    ['hook named in the declaration', (d) => { d.mechanisms[0].wire = '.githooks/pre-push'; }, 'F6'],
    ['judgment mechanism claims a gate outcome', (d) => { d.mechanisms[4].outcome = { at: 'x', clear: ['a'] }; }, 'F5'],
    ['non-clear result with no reason (report)', (d) => { d.mechanisms[1].reason = ['nothing[]']; }, 'F3'],
    ['owner differs from the ownership claim', (d) => { d.owner.id = '0'.repeat(64); }, 'F1'],
  ];
  console.log('\nSELFTEST: each mutant of the draft must fail the named requirement');
  for (const [label, mutate, req] of mutants) {
    const d = JSON.parse(JSON.stringify(decl)); mutate(d);
    console.log(`  ${verdict(await conforms({ declaration: d, root, fixtures }))[req] === 'FAIL' ? 'CAUGHT' : 'MISSED'}  ${req}  ${label}`);
  }
}
