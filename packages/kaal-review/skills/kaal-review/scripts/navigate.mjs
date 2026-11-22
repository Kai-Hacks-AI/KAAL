// Navigation of Review items and results: which items validate a subject, which results appraise an item, and which result applies at a revision.
// Pure over a tree read as text through Hosting alone (list with skip and links, then readFile). It assumes no layout, no Git and no station,
// states no coverage and no approval, and never runs or imports what it reads.
import { list, readFile } from '@kaihacksai/kaal-hosting';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const ITEM = /(^|\/)V(\d+)\.md$/, RES = /(^|\/)RV(\d+)\.md$/;
const SKIPPED = ['node_modules', '.git'];
async function walk(root) {
  const out = [];
  for (const e of await list(root, { skip: SKIPPED, links: 'skip' })) if (e.kind === 'file') out.push(e.path);
  return out.sort();
}
export function parse(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/); if (!m) return { front: {}, body: text, malformed: [] };
  const front = {}, malformed = []; let key = null;
  for (const line of m[1].split('\n')) {
    const li = line.match(/^\s+-\s+(.*)$/); if (li && key) { if (Array.isArray(front[key])) front[key].push(li[1]); else malformed.push(`${key}: a list item follows a scalar value`); continue; }
    const kv = line.match(/^([\w-]+):\s*(.*)$/); if (!kv) continue; key = kv[1];
    const v = kv[2]; if (v === '') front[key] = []; else if (/^\[.*\]$/.test(v)) front[key] = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean); else front[key] = v;
  }
  return { front, body: m[2], malformed };
}
const chapter = (body, name) => { const m = body.match(new RegExp(`^## ${name}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm')); return m ? m[1].trim() : null; };
const bullets = (t) => (t ?? '').split('\n').filter((l) => /^\s*-\s/.test(l)).map((l) => l.replace(/^\s*-\s*/, ''));
const num = (id) => Number(id.match(/(\d+)$/)?.[1] ?? Infinity);
export async function navigate(root, { revision } = {}) {
  const findings = [], items = [], results = [];
  const add = (kind, files, detail) => findings.push({ kind, files, detail });
  const files = await walk(root);
  const found = { item: [], res: [] };
  for (const f of files) { const t = ITEM.test(f) ? 'item' : RES.test(f) ? 'res' : null; if (!t) continue; const { front, body, malformed } = parse((await readFile(join(root, f))).toString('utf8')); for (const k of ['validates', 'parts']) if (k in front && !Array.isArray(front[k])) malformed.push(`${k}: a list is expected`); for (const k of ['id', 'appraises', 'revision', 'appraiser', 'relation', 'execution', 'conclusion', 'carries']) if (k in front && typeof front[k] !== 'string') malformed.push(`${k}: a single value is expected`); if (malformed.length) { add('malformed-front-matter', [f], malformed.join('; ')); continue; } if (!front.id) { add('no-id', [f], 'the file declares no id'); continue; } found[t].push({ f, front, body }); }
  const dup = (list) => { const m = new Map(); for (const x of list) m.set(x.front.id, [...(m.get(x.front.id) ?? []), x]); const ok = []; for (const [id, xs] of m) { if (xs.length > 1) add('duplicate-id', xs.map((x) => x.f), `duplicate id: ${id}`); else ok.push(xs[0]); } return ok; };
  for (const { f, front, body } of dup(found.item)) {
    const q = chapter(body, 'Question'), c = bullets(chapter(body, 'Criteria')), e = bullets(chapter(body, 'Expected evidence')), v = front.validates ?? [];
    if (!v.length || !q || !c.length || !e.length) { add('item-incomplete', [f], 'an item needs validates, a Question, Criteria and Expected evidence'); continue; }
    items.push({ id: front.id, file: f, validates: v, question: q, criteria: c, evidence: e });
  }
  items.sort((a, b) => num(a.id) - num(b.id));
  const itemIds = new Set(items.map((i) => i.id));
  const rs = dup(found.res);
  const byId = new Map(rs.map((r) => [r.front.id, r]));
  for (const { f, front, body } of rs) {
    const res = chapter(body, 'Result'); const parts = front.parts ?? [];
    const r = { id: front.id, file: f, appraises: front.appraises, revision: front.revision, execution: front.execution, conclusion: front.conclusion ?? null, carries: front.carries ?? null, relation: front.relation ?? null, appraiser: front.appraiser, parts };
    let bad = false; const flag = (k, d) => { add(k, [f], d); bad = true; };
    if (!r.revision || !r.appraiser || chapter(body, 'Execution') === null) flag('result-incomplete', 'a result names a revision and an appraiser and has an Execution chapter');
    if (!itemIds.has(r.appraises)) flag('dangling-appraises', 'appraises an item that is not listed');
    if (r.execution !== 'performed' && r.execution !== 'could-not-perform') flag('bad-execution', 'the execution is neither performed nor could-not-perform');
    else if (r.execution === 'could-not-perform' && r.conclusion) flag('conclusion-without-performance', 'a conclusion without a performed assessment');
    if (r.execution === 'performed' && !r.conclusion) flag('performed-without-conclusion', 'performed with no conclusion');
    if (r.conclusion && !['satisfied', 'not-satisfied', 'unresolved'].includes(r.conclusion)) flag('bad-conclusion', `unknown conclusion ${r.conclusion}`);
    if (r.conclusion && r.conclusion !== 'unresolved' && parts.some((p) => /: (unresolved|not-satisfied)$/.test(p))) flag('part-contradicts-conclusion', 'a part contradicts the conclusion');
    if (r.execution === 'performed' && !r.relation) flag('no-relation', 'no appraiser relation');
    if (res && /^\s*(Decision|Verdict):\s*(approve|merge)/im.test(res)) flag('authority-claim', 'a result states an approval or a merge');
    if (r.carries) { const t = byId.get(r.carries); const carry = (k, d) => { flag(k, d); r.carryInvalid = true; }; if (!t) carry('carry-dangling', 'carries a result that does not exist'); else if (t.front.appraises !== r.appraises) carry('carry-other-item', 'carries a result that appraises another item'); else if (t.front.conclusion !== r.conclusion) carry('carry-conclusion-differs', 'a carry-forward keeps the conclusion it carries'); if (!res) carry('carry-without-reason', 'a carry-forward states no reason'); }
    if (!bad || r.appraises) results.push(r);
  }
  // Subjects and items are arbitrary identifiers, so they are keys of a Map and only become own properties of the answer at the end.
  const vb = new Map();
  for (const i of items) for (const s of i.validates) vb.set(s, [...(vb.get(s) ?? []), i.id]);
  const validatedBy = Object.fromEntries([...vb].map(([s, ids]) => [s, ids.sort((a, b) => num(a) - num(b))]));
  const cur = new Map(), stl = new Map();
  if (revision) for (const i of items) {
    const mine = results.filter((r) => r.appraises === i.id); const list = [], seen = new Set();
    for (const r of mine.filter((r) => r.revision === revision)) { list.push({ result: r.id, applicability: 'applies' }); seen.add(r.id); }
    for (const r of mine.filter((r) => r.revision === revision && r.carries && !r.carryInvalid)) if (!seen.has(r.carries)) { list.push({ result: r.carries, applicability: 'carried' }); seen.add(r.carries); }
    cur.set(i.id, list); stl.set(i.id, mine.filter((r) => !seen.has(r.id)).map((r) => r.id));
  }
  findings.sort((a, b) => a.kind.localeCompare(b.kind) || a.files[0].localeCompare(b.files[0]));
  return { items, results, validatedBy, current: Object.fromEntries(cur), stale: Object.fromEntries(stl), findings };
}

/** The part of an answer about one subject: the items that validate it, their results, and the findings are kept whole. */
export function about(answer, subject) {
  const ids = new Set(Object.hasOwn(answer.validatedBy, subject) ? answer.validatedBy[subject] : []);
  const own = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => ids.has(k)));
  return {
    items: answer.items.filter((i) => ids.has(i.id)),
    results: answer.results.filter((r) => ids.has(r.appraises)),
    validatedBy: Object.hasOwn(answer.validatedBy, subject) ? { [subject]: answer.validatedBy[subject] } : {},
    current: own(answer.current),
    stale: own(answer.stale),
    findings: answer.findings,
  };
}

// The command: navigate [--root dir] [--revision r] [--subject id]. It prints the answer as JSON, exits 0 whenever an answer was produced and gives no verdict.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  const known = new Set(['--root', '--revision', '--subject']);
  const stray = args.filter((a, i) => !known.has(a) && !known.has(args[i - 1]));
  if (stray.length || ['root', 'revision', 'subject'].some((n) => args.includes(`--${n}`) && opt(n) === undefined)) {
    console.error('usage: navigate [--root dir] [--revision r] [--subject id]');
    process.exit(2);
  }
  const answer = await navigate(opt('root') ?? process.cwd(), { revision: opt('revision') });
  console.log(JSON.stringify(opt('subject') === undefined ? answer : about(answer, opt('subject')), null, 2));
}
