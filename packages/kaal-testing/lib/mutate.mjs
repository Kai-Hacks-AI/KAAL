import { isAbsolute, join, relative, resolve } from 'node:path';
import { initialize, list, readFile, scratch } from '@kaihacksai/kaal-hosting';
import { runCases } from './run.mjs';

export const SCHEMA = 'kaal-testing/mutation-report@1';
const SPEC = 'kaal-testing/mutants@1';
const inside = (root, p) => { const r = relative(root, resolve(root, p)); return !r.startsWith('..') && !isAbsolute(r); };

function validate(root, spec) {
  if (spec?.schema !== SPEC) throw new Error(`invalid input: the spec is not of schema ${SPEC}`);
  if (!Array.isArray(spec.mutants) || spec.mutants.length === 0) throw new Error('invalid input: the spec has no mutants');
  const ids = new Set();
  for (const m of spec.mutants) {
    if (typeof m?.id !== 'string' || m.id === '' || ids.has(m.id)) throw new Error(`invalid input: the id of a mutant is missing or repeated (${m?.id})`);
    ids.add(m.id);
    if (typeof m.file !== 'string' || !inside(root, m.file)) throw new Error(`invalid input: ${m.id} names a file outside root`);
    if (typeof m.find !== 'string' || m.find === '' || typeof m.replace !== 'string') throw new Error(`invalid input: ${m.id} needs find and replace`);
    if (!Array.isArray(m.cases) || m.cases.length === 0 || m.cases.some((c) => typeof c !== 'string' || !inside(root, c))) throw new Error(`invalid input: ${m.id} needs Cases inside root`);
  }
}

async function copyOf(root, copy) {
  const files = {};
  const skip = ['.git', 'node_modules'];
  for (const dir of copy) {
    for (const e of await list(join(root, dir), { skip, links: 'skip' })) {
      if (e.kind !== 'file') continue;
      const rel = join(dir, e.path).replace(/^\.\//, '');
      files[rel] = await readFile(join(root, rel));
    }
  }
  return files;
}

export function classify(report) {
  const red = report.tests.filter((t) => t.actual === 'RED');
  if (red.length > 0) return { outcome: 'killed', killedBy: red.map((t) => t.id) };
  if (report.execution.complete && report.tests.length > 0 && report.tests.every((t) => t.actual === 'GREEN')) return { outcome: 'survived' };
  return { outcome: 'unresolved', reason: report.execution.problems.length > 0 ? report.execution.problems.map((p) => `${p.kind}: ${p.detail}`).join('; ') : 'the run did not show every test GREEN' };
}

async function runIn(files, cases, timeoutMs) {
  return scratch(async (dir) => {
    const tree = join(dir, 'tree');
    await initialize(tree, files);
    return runCases({ files: cases, root: tree, timeoutMs });
  });
}

export async function runMutants({ root, spec, timeoutMs }) {
  validate(root, spec);
  const files = await copyOf(root, spec.copy ?? ['.']);
  const union = [...new Set(spec.mutants.flatMap((m) => m.cases))].sort();
  const base = await runIn(files, union, timeoutMs);
  const ran = new Set(base.tests.map((t) => t.file));
  const ok = base.execution.complete && base.tests.length > 0 && base.tests.every((t) => t.actual === 'GREEN') && union.every((c) => ran.has(c));
  const baseline = { ok, complete: base.execution.complete, counts: base.counts, problems: base.execution.problems };
  const mutants = [];
  for (const m of spec.mutants) {
    const entry = { id: m.id, file: m.file, cases: m.cases, ...(m.claim ? { claim: m.claim } : {}) };
    const text = files[m.file]?.toString('utf8');
    let invalid;
    if (!ok) invalid = 'the baseline is not ok, so nothing a mutant does can be read';
    else if (text === undefined) invalid = `${m.file} is not in the copied tree`;
    else if (m.find === m.replace) invalid = 'replace equals find';
    else if (!text.includes(m.find)) invalid = 'find is absent from the file';
    else if (text.split(m.find).length > 2) invalid = 'find occurs more than once';
    if (invalid) { mutants.push({ ...entry, outcome: 'invalid', reason: invalid }); continue; }
    const changed = { ...files, [m.file]: Buffer.from(text.replace(m.find, () => m.replace)) };
    const rep = await runIn(changed, m.cases, timeoutMs);
    const c = classify(rep);
    mutants.push({ ...entry, ...c, problems: rep.execution.problems });
  }
  const counts = { killed: 0, survived: 0, invalid: 0, unresolved: 0 };
  for (const m of mutants) counts[m.outcome] += 1;
  return { schema: SCHEMA, baseline, counts, survivors: mutants.filter((m) => m.outcome === 'survived').map((m) => m.id), complete: ok && counts.invalid === 0 && counts.unresolved === 0, mutants };
}
