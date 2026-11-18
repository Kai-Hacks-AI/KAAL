// node cli.mjs decide: facts as JSON on standard input, the decision as JSON on standard output. It reads nothing else.
import { readFileSync } from 'node:fs';
import { decideRaise } from './decide.mjs';
if (process.argv[2] !== 'decide') { console.error('usage: cli.mjs decide < facts.json'); process.exit(2); }
let facts;
try { facts = JSON.parse(readFileSync(0, 'utf8')); } catch { console.error('the facts are not JSON'); process.exit(1); }
console.log(JSON.stringify(decideRaise(facts)));
