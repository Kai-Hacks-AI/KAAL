// hold Act: are the Cases that the content of a collector makes applicable really green at its head?
// It measures the checked-out tree (the folder it is handed) and nothing else. Pull requests and commits transport the work;
// their titles, their history and their shapes are never read.
// It holds the ACT: when no retro reflects a carried Change there is no ACT to hold and the answer is PASS; otherwise the Cases of the carried Changes decide.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const CASE_FILE = /(^|\/)T\d+\.(red|test)\.mjs$/;
// The relationships between elements, each one-way, from the element that declares it to the one it names.
const EDGES = ['implements', 'serves', 'addresses', 'has'];

const walk = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])) : []);

// The frontmatter of an element: `key: value` and `key: [a, b]`.
function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim();
    out[kv[1]] = v.startsWith('[') ? v.slice(1, v.lastIndexOf(']')).split(',').map((s) => s.trim()).filter(Boolean) : v;
  }
  return out;
}

// The elements of a tree: every Markdown file with a frontmatter id, and every draft (a block fenced by five backticks)
// in the files of the Change folder, where a PLAN keeps the elements that justify its Cases until the DO places them.
// An element that is placed wins over its draft.
export function elementsOf(root, changeDir) {
  const found = new Map();
  const add = (fm, placed) => { if (fm?.id && (placed || !found.has(fm.id))) found.set(fm.id, fm); };
  for (const file of walk(root).filter((f) => f.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    add(frontmatter(text), true);
    if (relative(root, file).startsWith(`${changeDir}/`)) for (const block of text.matchAll(/^`````\n([\s\S]*?)\n`````$/gm)) add(frontmatter(block[1]), false);
  }
  return found;
}

// The ids the Change justifies: the Intents its record (C<n>.md) implements, and every element that reaches one of them along the relationships.
export function justifiedBy(elements, change) {
  const justified = new Set(([]).concat(change?.implements ?? []));
  for (let grew = true; grew;) {
    grew = false;
    for (const [id, fm] of elements) {
      if (justified.has(id)) continue;
      if (EDGES.some((k) => ([]).concat(fm[k] ?? []).some((t) => justified.has(t)))) { justified.add(id); grew = true; }
    }
  }
  return justified;
}

// The Cases that apply to a Change: those in its folder, and those that test an element it justifies, wherever they are.
// A Case is parked red while any file carrying its id is a .red.mjs.
export function applicableCases(root, changeDir) {
  const record = readdirSync(join(root, changeDir)).find((f) => /^C\d+\.md$/.test(f));
  const change = record ? frontmatter(readFileSync(join(root, changeDir, record), 'utf8')) : null;
  const justified = justifiedBy(elementsOf(root, changeDir), change);
  const cases = new Map();
  for (const file of walk(root).filter((f) => CASE_FILE.test(f))) {
    const text = readFileSync(file, 'utf8');
    const id = text.match(/export const id = '([^']+)'/)?.[1];
    if (!id) continue;
    const tests = (text.match(/export const tests = \[([^\]]*)\]/)?.[1] ?? '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    const inChange = relative(root, file).startsWith(`${changeDir}/`);
    if (!inChange && !tests.some((t) => justified.has(t))) continue;
    const parked = file.endsWith('.red.mjs');
    const known = cases.get(id);
    cases.set(id, { id, path: relative(root, file), parked: parked || (known?.parked ?? false) });
  }
  return [...cases.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

// The retros as they are found: every Markdown file under 02-learnings/retros that declares what it reflects (`reflects: [C103, ...]`).
// Nothing else of a retro is read: its id and its format are kaal-retro's. No folder, no retros.
export function retrosOf(root) {
  return walk(join(root, '02-learnings/retros')).filter((f) => f.endsWith('.md')).map((f) => frontmatter(readFileSync(f, 'utf8')))
    .filter((fm) => fm && 'reflects' in fm).map((fm) => ({ reflects: ([]).concat(fm.reflects) }));
}

// The id of a Change from the name of its folder: 00-changes/C103-hold-act is C103.
export const changeIdOf = (changeDir) => changeDir.split('/').pop().match(/^(C\d+)(-|$)/)?.[1];

// changes: the Changes the collector carries, each { id, applicable }; retros: each { reflects: [ids] }. Pure over those facts.
// A retro holds the ACT of the Changes it reflects: the Cases of all the carried Changes together must be really green.
export function judgeHold({ changes, retros, observed }) {
  const cannot = (what) => ({ verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [], message: `cannot judge: ${what}` });
  if (!Array.isArray(changes) || !changes.every((c) => c && typeof c.id === 'string' && c.id !== '' && Array.isArray(c.applicable))) return cannot('the carried Changes are not known');
  if (!Array.isArray(retros) || !retros.every((r) => r && Array.isArray(r.reflects) && r.reflects.every((s) => typeof s === 'string'))) return cannot('the retros are not known');
  const carried = new Set(changes.map((c) => c.id));
  if (!retros.some((r) => r.reflects.some((id) => carried.has(id)))) return { verdict: 'PASS', findings: [], message: 'no retro reflects a carried Change: there is no ACT to hold' };
  return judgeFinished({ changes, observed });
}

// Is the work of all the carried Changes finished: every Case that applies to any of them really green? The Cases of the Changes are judged together.
export function judgeFinished({ changes, observed }) {
  const all = new Map();
  for (const c of changes) for (const k of c.applicable) all.set(k.id, { ...k, parked: Boolean(k.parked || all.get(k.id)?.parked) });
  const applicable = [...all.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  return judgeAct({ applicable, observed, acted: true });
}

// observed: { 'release/T123': 'GREEN' | 'RED' | 'UNKNOWN' } from the observation of Testing. An exit code is never a verdict.
export function judgeAct({ applicable, observed, acted }) {
  if (acted !== true && acted !== false) return { verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [], message: 'cannot judge: it is not known whether a retro reflects the Change' };
  if (acted === false) return { verdict: 'PASS', findings: [], message: 'no retro reflects the Change: there is no ACT to hold' };
  if (!applicable?.length) return { verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [{ id: '-', reason: 'no Case applies, so nothing can be really green' }], message: 'cannot judge: no Case applies' };
  const findings = [];
  for (const c of applicable) {
    if (c.parked) findings.push({ id: c.id, reason: 'still planned red (a .red.mjs file)', fail: true });
    else if (observed?.[c.id] === 'RED') findings.push({ id: c.id, reason: 'observed RED', fail: true });
    else if (observed?.[c.id] !== 'GREEN') findings.push({ id: c.id, reason: 'not observed green', fail: false });
  }
  const failed = findings.filter((f) => f.fail);
  const progress = { red: failed.length, green: applicable.length - findings.length, unknown: findings.length - failed.length };
  if (failed.length) return { verdict: 'FAIL', progress, findings, message: `finish your work first: ${failed.map((f) => f.id).join(', ')} of ${applicable.length} applicable Cases are not really green` };
  if (findings.length) return { verdict: 'UNKNOWN', progress, findings, message: `cannot judge: ${findings.map((f) => f.id).join(', ')} not observed green` };
  return { verdict: 'PASS', progress, findings: [] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const root = arg('--root') ?? '.';
    const dirs = (arg('--changes') ?? '').split(',').filter(Boolean);
    const ids = dirs.map(changeIdOf);
    if (!dirs.length || ids.some((id) => !id) || dirs.some((d) => !existsSync(join(root, d)))) throw new Error('the carried Changes are not known');
    const retros = retrosOf(root);
    const held = retros.some((x) => x.reflects.some((id) => ids.includes(id)));
    r = held
      ? judgeHold({ changes: dirs.map((d, i) => ({ id: ids[i], applicable: applicableCases(root, d) })), retros, observed: JSON.parse(readFileSync(arg('--observed'), 'utf8')) })
      : judgeHold({ changes: ids.map((id) => ({ id, applicable: [] })), retros });
  } catch (e) { r = { verdict: 'UNKNOWN', findings: [], message: String(e.message) }; }
  console.log(`${r.verdict}${r.message ? `: ${r.message}` : ''}${r.progress ? ` (red ${r.progress.red}, green ${r.progress.green}, unknown ${r.progress.unknown})` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
