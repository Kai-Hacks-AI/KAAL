// demand Act: once the work of a collector is finished, does it have exactly one ACT, one retro that reflects every Change it carries? Pure over facts: nothing is read from Git or GitHub.
// judgeDemandAct({ changes, retros, observed }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', message[, due, acts] }
// changes: the Changes a promotion carries, each { id, applicable }; retros: each { reflects: [ids] } (the id and the format of a retro are not read);
// observed: the observations of Testing. Whether work is really green is decided by hold Act's judge, not here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { retrosOf, carriedChanges } from './lib/collector.mjs';
import { applicableCasesAreGreen } from './lib/cases-green.mjs';

const unknown = (message) => ({ verdict: 'UNKNOWN', message });

export function judgeDemandAct(facts) {
  const { changes, retros, observed } = facts && typeof facts === 'object' ? facts : {};
  if (!Array.isArray(changes) || !changes.every((c) => c && typeof c.id === 'string' && c.id !== '' && Array.isArray(c.applicable))) return unknown('the carried Changes could not be read');
  if (!Array.isArray(retros) || !retros.every((r) => r && Array.isArray(r.reflects) && r.reflects.every((s) => typeof s === 'string'))) return unknown('the retros could not be read');
  const count = (id) => retros.filter((r) => r.reflects.includes(id)).length;
  const acts = retros.filter((r) => r.reflects.some((id) => changes.some((c) => c.id === id)));
  const unreflected = changes.filter((c) => count(c.id) === 0).map((c) => c.id);
  const problems = [];
  let due = [], cannot = false;
  if (acts.length > 1) problems.push(`more than one ACT for the collector: ${acts.map((r) => `[${r.reflects.join(', ')}]`).join(' ')}`);
  if (unreflected.length) {
    const finished = applicableCasesAreGreen({ changes, observed }).verdict;
    if (finished === 'PASS') { due = unreflected; problems.push(`Changes closed, retro due: ${due.join(', ')}`); }
    else if (finished === 'UNKNOWN') cannot = true;
  }
  if (problems.length) return { verdict: 'FAIL', message: problems.join('; '), due, acts: acts.length };
  if (cannot) return unknown(`cannot tell whether the work is finished, and these Changes are reflected by no retro: ${unreflected.join(', ')}`);
  return { verdict: 'PASS', message: 'nothing is due', due, acts: acts.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const dirs = (arg('--changes') ?? '').split(',').filter(Boolean);
    const carried = carriedChanges(root, dirs);
    const ids = carried.map((c) => c.id);
    const retros = retrosOf(root);
    const open = ids.some((id) => !retros.some((x) => x.reflects.includes(id)));
    const observed = open ? JSON.parse(readFileSync(arg('--observed'), 'utf8')) : undefined;
    r = judgeDemandAct({ changes: carried.map((c) => ({ id: c.id, applicable: open ? c.applicable : [] })), retros, observed });
  } catch (e) { r = unknown(String(e.message)); }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
