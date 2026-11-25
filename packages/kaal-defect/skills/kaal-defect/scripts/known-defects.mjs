#!/usr/bin/env node
// known-defects: derive each Defect's state from the Test Cases that point at it, as Controls derive a status from the Cases of a control.
// A Defect holds no state. Edges run from a Case to a Defect (the Case's first line `// Case <id> tests: <defect id>`).
// A record is { case, run, revision, outcome }, outcome GREEN, RED or UNKNOWN as a Case runner reports it. The runner is Testing's; nothing here runs a Case.
import { list, readFile } from '@kaihacksai/kaal-hosting';
import { join } from 'node:path';

const DEFECT = /^[a-z][a-z0-9-]*\/D[1-9][0-9]*$/;
const OUTCOMES = new Set(['GREEN', 'RED', 'UNKNOWN']);

/** What one Case shows at `revision`: RED if any applicable run is RED, GREEN if every applicable run is GREEN, otherwise UNKNOWN. */
function caseOutcome(id, records, revision) {
  const mine = records.filter((r) => r.case === id && r.revision === revision);
  const o = mine.map((r) => (OUTCOMES.has(r.outcome) ? r.outcome : 'UNKNOWN'));
  return o.includes('RED') ? 'RED' : o.length && o.every((x) => x === 'GREEN') ? 'GREEN' : 'UNKNOWN';
}

/**
 * The derived state of a Defect, from the Cases that point at it, at one revision.
 * confirmed: some applicable Case is RED, even if every other Case is UNKNOWN. answered: it has Cases, every applicable Case is GREEN with
 * complete evidence. Otherwise unknown: no Case, or a stale, missing, incomplete or UNKNOWN result. UNKNOWN is never RED and never GREEN.
 */
export function judgeDefect(defect, cases, records = [], revision) {
  const o = cases.map((c) => caseOutcome(c, records, revision));
  const state = o.includes('RED') ? 'confirmed' : o.length && o.every((x) => x === 'GREEN') ? 'answered' : 'unknown';
  return { id: defect, state, cases: cases.map((c, i) => ({ case: c, outcome: o[i] })) };
}

/**
 * Defect records, the Architecture elements that address them, and the Cases that point at a Defect, read from the locations the caller hands over.
 * `places` is a list of { context, defects, architecture, cases }: `context` names the place a Defect was found, `defects` is the folder holding its
 * Defect records, `architecture` the folders holding its Architecture elements, and `cases` the folders holding its Test Cases. This script knows no layout.
 * A Defect record is authoritative: the inventory is every record found, and there is no second list of them.
 */
export async function readTree(places) {
  const defects = new Map(); // id -> { context }
  const addressedBy = new Map(); // defect id -> [contexts of the Architecture elements that address it]
  const pointing = new Map(); // defect id -> [case ids]
  // Every file under a folder, read as text through Hosting alone; a missing folder holds nothing.
  const files = async (dir, test) => {
    const out = [];
    for (const e of await list(dir, { skip: ['node_modules', '.git'], links: 'skip' })) if (e.kind === 'file' && test(e.path)) out.push([e.path, (await readFile(join(dir, e.path))).toString('utf8')]);
    return out;
  };
  const base = (p) => p.slice(p.lastIndexOf('/') + 1);
  for (const { context, defects: dir, architecture = [], cases = [] } of places) {
    for (const [, t] of dir ? await files(dir, (p) => p.endsWith('.md')) : []) {
      const id = t.match(/^id:\s*(\S+)\s*$/m)?.[1];
      if (id && DEFECT.test(id)) defects.set(id, { context });
    }
    for (const a of architecture) for (const [, t] of await files(a, (p) => p.endsWith('.md'))) {
      const l = t.match(/^addresses:\s*\[(.*)\]\s*$/m)?.[1] ?? ''; // the Architecture —addresses→ Defect relationship
      for (const id of l.split(',').map((x) => x.trim()).filter((x) => DEFECT.test(x))) { const c = addressedBy.get(id) ?? addressedBy.set(id, []).get(id); if (!c.includes(context)) c.push(context); }
    }
    for (const c of cases) for (const [, t] of await files(c, (p) => /^T\d+\.(red|test)\.mjs$/.test(base(p)))) {
      const h = /^\/\/ Case (\S+) tests: (.*)$/.exec(t.split('\n')[0]);
      if (h) for (const d of h[2].split(',').map((x) => x.trim()).filter((x) => DEFECT.test(x))) (pointing.get(d) ?? pointing.set(d, []).get(d)).push(h[1]);
    }
  }
  return { defects, addressedBy, pointing };
}

/** One line per Defect record, `<state> <defect>`, then one indented `<case> <outcome>` line per Case that points at it. */
export function report(tree, records, revision) {
  const out = [];
  for (const [id] of [...tree.defects].sort()) {
    const j = judgeDefect(id, tree.pointing.get(id) ?? [], records, revision);
    out.push(`${j.state} ${id}`);
    for (const c of j.cases) out.push(`  ${c.case} ${c.outcome}`); // each Case's own outcome stays beside the derived state
  }
  return out;
}

/**
 * The unresolved inventory, an input to planning and no order to fix: every Defect record that is not answered, grouped by the context of the
 * Architecture element that addresses it (its correction belongs there), or by the context that holds the Defect while none addresses it.
 * Defect never moves a record and sets nothing; where a correction belongs is Architecture's.
 */
export function toFix(tree, records, revision) {
  const g = {};
  for (const [id, d] of tree.defects) {
    if (judgeDefect(id, tree.pointing.get(id) ?? [], records, revision).state === 'answered') continue;
    for (const o of tree.addressedBy.get(id) ?? [d.context]) (g[o] ??= []).push(id);
  }
  return g;
}

if (process.argv[1] && process.argv[1].endsWith('known-defects.mjs')) {
  const a = process.argv.slice(2); const opt = (k) => a[a.indexOf(k) + 1];
  const json = async (k) => JSON.parse((await readFile(opt(k))).toString('utf8'));
  const tree = await readTree(await json('--places'));
  const records = a.includes('--records') ? await json('--records') : [];
  const revision = opt('--revision');
  if (a.includes('--list')) { for (const [o, ds] of Object.entries(toFix(tree, records, revision))) console.log(`${o}: ${ds.join(', ')}`); }
  else for (const l of report(tree, records, revision)) console.log(l);
}
