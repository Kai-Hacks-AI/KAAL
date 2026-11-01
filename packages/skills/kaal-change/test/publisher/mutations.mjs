// Publisher-only behavioural mutation challenges. Run alone, never during packing.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, reconcile, execute } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
const root = fileURLToPath(new URL('../../', import.meta.url));
const path = 'lib/isolation.mjs', original = await readFile(join(root, path));
const source = original.toString('utf8');
const mutants = [
  ['accept malformed proposals', 'T41', [["if (findings.length) return result();", "findings.length = 0;"]]],
  ['drop Defect regression', 'T42', [["else if (e.kind === 'defect') oblige('implementation', 'regression', e.identity, e.owner);", "else if (e.kind === 'defect') {}"]]],
  ['drop nonfunctional impact', 'T42', [["impact: ordered(impact),", "impact: ordered(impact.filter(e => e.kind !== 'nonfunctional-requirement'))," ]]],
  ['freeze out new dependents', 'T43', [["const impact = [...impactIds].map(id => byId.get(id));", "const impact = [...impactIds].map(id => byId.get(id)).filter(e => e.owner !== 'audit');"]]],
  ['wrong traversal direction', 'T42', [["walk(e.ref.id, 'in', impactIds)", "walk(e.ref.id, 'out', impactIds)"]]],
  ['drop incoming boundary', 'T44', [["boundaries: ordered(boundaries),", "boundaries: ordered(boundaries.filter(b => b.direction !== 'incoming'))," ]]],
  ['drop outgoing boundary', 'T44', [["boundaries: ordered(boundaries),", "boundaries: ordered(boundaries.filter(b => b.direction !== 'outgoing'))," ]]],
  ['ignore declared missing trace', 'T47', [["if (!observed.has(key))", "if (false)"]]],
  ['ignore missing interface inventory', 'T44', [["if (!b || b.from !== t.source.name || b.to !== t.target.name)", "if (false)"]]],
  ['self-attested authority', 'T47', [["authority: { status: 'unestablished'", "authority: { status: 'established'"]]],
  ['claim unexecuted obligations passed', 'T45', [["boundary, status: 'not-assessed'", "boundary, status: 'pass'"]]],
  ['drop independent contract evidence', 'T46', [["oblige('capability-acceptance', 'contract', b.contract.name, b.owner, b.identity);", "/* contract omitted */"]]],
  ['drop real integration', 'T46', [["oblige('capability-acceptance', 'real-integration', b.identity, owner, b.identity);", "/* integration omitted */"]]],
  ['drop driver obligation', 'T44', [["b.direction === 'incoming' ? 'driver' : 'controlled-collaborator'", "b.direction === 'incoming' ? 'controlled-collaborator' : 'controlled-collaborator'"]]],
  ['drop controlled collaborator', 'T44', [["b.direction === 'incoming' ? 'driver' : 'controlled-collaborator'", "b.direction === 'incoming' ? 'driver' : 'driver'"]]],
  ['drop real subject', 'T45', [["else if (e.kind === 'realization') oblige('implementation', 'real-subject', e.identity, e.owner);", "else if (e.kind === 'realization') {}"]]],
  ['accept stale proposal binding', 'T49', [
    ["if (!ref(proposal.ref) || !ref(model.change) || !same(proposal.ref, model.change))", "if (false)"],
    ["const change = ref(proposal.ref) && graph.resolve(proposal.ref);", "const change = graph.resolve(model.change);"]]],
  ['mutate caller source ordering', 'T49', [["modelDigest = sha256(", "model.sources.reverse(); modelDigest = sha256("]]],
  ['missing Graph becomes isolated', 'T47', [["unknown('graph-unavailable', 'model', 'A Graph public view is required; no fallback traversal is used.');", "/* missing adapter ignored */"]]],
  ['host dependency in pure core', 'T48', [["import { sha256 }", "import { readFileSync } from 'node:fs';\nimport { sha256 }"]]],
];
const results = [];
let current = original;
try {
  for (const [name, target, replacements] of mutants) {
    let altered = source;
    for (const [from, to] of replacements) {
      if (!altered.includes(from)) throw new Error('mutation target disappeared: ' + name);
      altered = altered.replace(from, to);
    }
    const bytes = Buffer.from(altered);
    await reconcile(root, { write: [{ path, bytes, expect: sha256(current) }], remove: [] });
    current = bytes;
    const file = target === 'T48' ? 'test/publisher/architecture.test.mjs' : 'test/embed/isolation.test.mjs';
    const run = await execute(process.execPath, ['--test', '--test-name-pattern=change/' + target, file], { cwd: root });
    const killed = run.status !== 0 && (run.stdout + run.stderr).includes('AssertionError');
    results.push({ name, target, killed });
    if (!killed) console.error(name + ': survived or blocked\n' + run.stdout + run.stderr);
  }
} finally {
  await reconcile(root, { write: [{ path, bytes: original, expect: sha256(current) }], remove: [] });
}
console.log(JSON.stringify(results, null, 2));
if (results.some(r => !r.killed)) process.exit(1);
