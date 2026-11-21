// verify Act: is every retro that reflects a Change of the collector well formed? Pure over facts: nothing is read from Git or GitHub.
// judgeVerifyAct({ carried, retros, refused }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', applies, message, malformed, unjudged }
// applies is false only on a PASS with no retro of a carried Change to verify (lib/result.mjs).
// carried: the ids of the Changes a collector carries; retros: each { path, reflects: [ids], form: { result, problems } }, the finding and the form judgement of kaal-retro;
// refused: what kaal-retro's finder refused, each { path, reason }. The form of a retro is kaal-retro's: this judge only says what its result means for the collector.
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { changeIdOf } from './lib/collector.mjs';
import { walk } from './lib/tree.mjs';
import { pass, fail, unknown as cannotTell } from './lib/result.mjs';

const unknown = (message) => cannotTell(message, { malformed: [], unjudged: [] });

export function judgeVerifyAct(facts) {
  const { carried, retros, refused = [] } = facts && typeof facts === 'object' ? facts : {};
  if (!Array.isArray(carried) || !carried.every((id) => typeof id === 'string' && id !== '')) return unknown('the carried Changes could not be read');
  if (!Array.isArray(retros) || !retros.every((r) => r && typeof r.path === 'string' && Array.isArray(r.reflects) && r.reflects.every((s) => typeof s === 'string'))) return unknown('the retros could not be read');
  if (!Array.isArray(refused) || !refused.every((r) => r && typeof r.path === 'string')) return unknown('what the finder refused could not be read');
  const ours = retros.filter((r) => r.reflects.some((id) => carried.includes(id)));
  const rules = (r) => [...new Set((r.form?.problems ?? []).map((p) => p.rule))];
  const malformed = ours.filter((r) => r.form?.result === 'malformed');
  const unjudged = ours.filter((r) => r.form?.result !== 'well-formed' && r.form?.result !== 'malformed');
  const problems = [
    ...refused.map((x) => `${x.path} is not a retro the finder accepts${x.reason ? ` (${x.reason})` : ''}`),
    ...malformed.map((r) => `${r.path} is not well formed (${rules(r).join(', ') || 'no rule named'})`),
  ];
  if (problems.length) return fail(`retro form: ${problems.join('; ')}`, { malformed: malformed.map((r) => r.path), unjudged: unjudged.map((r) => r.path) });
  if (unjudged.length) return cannotTell(`cannot judge the form of: ${unjudged.map((r) => r.path).join(', ')}`, { malformed: [], unjudged: unjudged.map((r) => r.path) });
  return pass(ours.length ? 'every retro of the carried Changes is well formed' : 'no retro reflects a carried Change: there is no ACT to verify', { applies: ours.length > 0, malformed: [], unjudged: [] });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const scripts = arg('--retro');
    const dirs = (arg('--changes') ?? '').split(',').filter(Boolean);
    const carried = dirs.map((d) => changeIdOf(root, d));
    if (!dirs.length || carried.some((id) => !id)) throw new Error('the carried Changes are not known');
    if (!scripts || !existsSync(join(scripts, 'find-retros.mjs')) || !existsSync(join(scripts, 'judge-retro.mjs'))) throw new Error('the scripts of kaal-retro are not given');
    const { findRetros } = await import(pathToFileURL(join(scripts, 'find-retros.mjs')).href);
    const { judgeRetro } = await import(pathToFileURL(join(scripts, 'judge-retro.mjs')).href);
    const files = walk(join(root, '02-learnings/retros')).filter((f) => f.endsWith('.md')).map((f) => ({ path: relative(root, f), text: readFileSync(f, 'utf8') }));
    const found = findRetros(files);
    const retros = found.retros.map((x) => ({ path: x.path, reflects: x.reflects, form: judgeRetro(files.find((f) => f.path === x.path).text) }));
    r = judgeVerifyAct({ carried, retros, refused: found.refused });
  } catch (e) { r = unknown(String(e.message)); }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
