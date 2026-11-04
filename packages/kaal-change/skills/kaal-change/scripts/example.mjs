// A controlled illustration of the public API, never repository evidence.
import { isolate } from '@kaihacksai/kaal-change/isolation';
import { example } from './example-model.mjs';

if (process.argv.length > 2) {
  console.error('usage: node example.mjs (controlled examples only; no target input)');
  process.exit(2);
}
const examples = [
  ['complete-model', {}],
  ['missing-interface', { omitInterface: 'shop/A2' }],
  ['new-dependent', { extraDependent: true }],
].map(([name, options]) => {
  const { proposal, model } = example(options);
  const r = isolate(proposal, model);
  return { name, evidence: 'controlled-example', assessment: r.assessment,
    boundaries: r.boundaries.map(b => ({ identity: b.identity, direction: b.direction })),
    affectedOutside: r.affectedOutside.map(e => e.identity),
    obligations: [...new Set(r.obligations.map(o => o.kind))].sort(),
    findings: [...new Set(r.findings.map(f => f.code))].sort(),
    authority: r.authority.status, execution: r.execution.status };
});
console.log(JSON.stringify({ examples }, null, 2));
