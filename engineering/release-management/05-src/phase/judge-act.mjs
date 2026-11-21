// hold Act: are the Cases that the content of a collector makes applicable really green at its head?
// It measures the checked-out tree (the folder it is handed) and nothing else. Pull requests and commits transport the work;
// their titles, their history and their shapes are never read.
// It holds the ACT: when no retro reflects a carried Change there is no ACT to hold and the answer is PASS; otherwise the Cases of the carried Changes decide.
import { readFileSync } from 'node:fs';
import { retrosOf, carriedChanges } from './lib/collector.mjs';
import { casesAreGreen, applicableCasesAreGreen } from './lib/cases-green.mjs';

// The facts this judge always offered stay offered, as the library's own.
export { elementsOf, justifiedBy, applicableCases, retrosOf, changeIdOf } from './lib/collector.mjs';

// changes: the Changes the collector carries, each { id, applicable }; retros: each { reflects: [ids] }. Pure over those facts.
// A retro holds the ACT of the Changes it reflects: the Cases of all the carried Changes together must be really green.
export function judgeHold({ changes, retros, observed }) {
  const cannot = (what) => ({ verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [], message: `cannot judge: ${what}` });
  if (!Array.isArray(changes) || !changes.every((c) => c && typeof c.id === 'string' && c.id !== '' && Array.isArray(c.applicable))) return cannot('the carried Changes are not known');
  if (!Array.isArray(retros) || !retros.every((r) => r && Array.isArray(r.reflects) && r.reflects.every((s) => typeof s === 'string'))) return cannot('the retros are not known');
  const unqualified = retros.flatMap((r) => r.reflects).filter((id) => !id.includes('/'));
  if (unqualified.length) return cannot(`a retro reflects ${unqualified.join(', ')}, which is not a qualified Change id (<capability>/C<n>)`);
  const carried = new Set(changes.map((c) => c.id));
  if (!retros.some((r) => r.reflects.some((id) => carried.has(id)))) return { verdict: 'PASS', findings: [], message: 'no retro reflects a carried Change: there is no ACT to hold' };
  return applicableCasesAreGreen({ changes, observed });
}

// acted: does a retro reflect the Change? Without one there is no ACT to hold; with one the Cases must be really green.
export function judgeAct({ applicable, observed, acted }) {
  if (acted !== true && acted !== false) return { verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [], message: 'cannot judge: it is not known whether a retro reflects the Change' };
  if (acted === false) return { verdict: 'PASS', findings: [], message: 'no retro reflects the Change: there is no ACT to hold' };
  return casesAreGreen({ applicable, observed });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const dirs = (arg('--changes') ?? '').split(',').filter(Boolean);
    const carried = carriedChanges(root, dirs);
    const ids = carried.map((c) => c.id);
    const retros = retrosOf(root);
    const held = retros.some((x) => x.reflects.some((id) => ids.includes(id)));
    r = held
      ? judgeHold({ changes: carried, retros, observed: JSON.parse(readFileSync(arg('--observed'), 'utf8')) })
      : judgeHold({ changes: ids.map((id) => ({ id, applicable: [] })), retros });
  } catch (e) { r = { verdict: 'UNKNOWN', findings: [], message: String(e.message) }; }
  console.log(`${r.verdict}${r.message ? `: ${r.message}` : ''}${r.progress ? ` (red ${r.progress.red}, green ${r.progress.green}, unknown ${r.progress.unknown})` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
