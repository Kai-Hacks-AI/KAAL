// Developer verification only. Mutate isolated sibling copies through Hosting.
// This does not modify the source evaluator, publish checks or probe GitHub.
import { read, initialize, reconcile, execute } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../', import.meta.url));
const files = await read(source);
const cases = [
  ['evaluator replaced with passing verdict', 'report.mjs',
    'judgeFullMatrix(authority, manifest, evidence, current, now)', "({verdict: 'passed', stage: 'mutated', errors: []})",
    'implementation.test.mjs', 'failed leaf'],
  ['child certified before full completion', 'report.mjs',
    "const certified = evaluation.verdict === 'passed';", 'const certified = true;',
    'acceptance.test.mjs', 'delayed last Windows'],
  ['stale context ignored', 'report.mjs',
    'judgeFullMatrix(authority, manifest, evidence, current, now)',
    'judgeFullMatrix(authority, manifest, evidence, fullExpected(authority).context, now)',
    'implementation.test.mjs', 'stale target'],
  ['collector mislabeled as Main', 'report.mjs',
    'profile: {...structuredClone(profile), event:', "profile: {...structuredClone(profile), gate: 'KAAL', event:",
    'acceptance.test.mjs', 'SYNC from main'],
  ['mixed tests reported as Product-only', 'catalog.mjs', "dimension: 'mixed'", "dimension: 'product'",
    'acceptance.test.mjs', 'Product and Engine coverage'],
  ['Windows Guard family omitted', 'catalog.mjs', "jobKeys: ['guard', 'guard-hosts']", "jobKeys: ['guard']",
    'acceptance.test.mjs', 'pull_request into main'],
  ['ambiguous collector owner accepted', 'projection.mjs', 'if (owners.length !== 1)', 'if (false)',
    'implementation.test.mjs', 'duplicate owner'],
  ['refusal diagnostics erased', 'report.mjs', 'errors: [...evaluation.errors],', 'errors: [],',
    'implementation.test.mjs', 'truncated page'],
];
const results = [];
for (let i = 0; i < cases.length; i++) {
  const [name, module, from, to, test, pattern] = cases[i], path = `collectors/${module}`;
  const original = files[path].toString('utf8');
  const occurrences = original.split(from).length - 1;
  // The mixed-dimension mutation intentionally changes all five mixed buckets.
  if (occurrences !== (module === 'catalog.mjs' && from === "dimension: 'mixed'" ? 5 : 1))
    throw new Error(`mutation anchor changed: ${name}`);
  const changed = {...files, [path]: Buffer.from(original.replaceAll(from, to))};
  const copy = fileURLToPath(new URL(`../../.collectors-mutation-${Date.now()}-${process.pid}-${i}/`, import.meta.url));
  await initialize(copy, changed);
  try {
    const run = await execute(process.execPath,
      ['--test', '--test-name-pattern', pattern, `${copy}/collectors/${test}`], {cwd: source});
    const output = run.stdout + run.stderr;
    const discriminatedByAssertion = run.status === 1 && /ERR_ASSERTION/.test(output) &&
      !/SyntaxError|ERR_MODULE_NOT_FOUND/.test(output);
    results.push({name, module, from, to, test, pattern, exitStatus: run.status, discriminatedByAssertion});
  } finally {
    await reconcile(copy, {write: [], remove: Object.entries(changed).map(([path, bytes]) =>
      ({path, expect: sha256(bytes)}))});
  }
}
console.log(JSON.stringify({schema: 'kaal.collector-mutations/v1', results}, null, 2));
if (results.some(r => !r.discriminatedByAssertion)) process.exitCode = 1;
