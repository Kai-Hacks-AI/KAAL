#!/usr/bin/env node
// known-defects: derive each Defect's state from the Test Cases that point at it, as Controls derive a status from the Cases of a control.
// A Defect holds no state. Edges run from a Case to a Defect (the Case's first line `// Case <id> tests: <defect id>`).
// A record is { case, run, revision, outcome, complete }, outcome GREEN, RED or UNKNOWN as a Case runner reports it, and `complete` the runner's own
// statement that the run observed everything that should count. A GREEN without `complete: true` is UNKNOWN. The runner is Testing's; nothing here runs a Case.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DEFECT = /^[a-z][a-z0-9-]*\/D[1-9][0-9]*$/;
const OUTCOMES = new Set(['GREEN', 'RED', 'UNKNOWN']);

/** What one Case shows at `revision`: RED if any applicable run is RED, GREEN if every applicable run is GREEN, otherwise UNKNOWN. */
function caseOutcome(id, records, revision) {
  const mine = records.filter((r) => r.case === id && r.revision === revision);
  const o = mine.map((r) => (!OUTCOMES.has(r.outcome) || (r.outcome === 'GREEN' && r.complete !== true) ? 'UNKNOWN' : r.outcome));
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
 * A location that is handed over but cannot be discovered (missing, not a folder, unreadable) is not an empty one: it is recorded in `incomplete`
 * as { context, role, path, reason }, and an empty folder that exists is a verified empty answer. A place that hands over no location of a role owns that scope.
 */
export function readTree(places) {
  const defects = new Map(); // id -> { context }
  const addressedBy = new Map(); // defect id -> [contexts of the Architecture elements that address it]
  const pointing = new Map(); // defect id -> [case ids]
  const incomplete = []; // locations handed over that could not be discovered
  const available = (context, role, dir) => {
    try { if (statSync(dir).isDirectory()) return true; incomplete.push({ context, role, path: dir, reason: 'not a folder' }); } catch (e) { incomplete.push({ context, role, path: dir, reason: e.code === 'ENOENT' ? 'missing' : (e.code ?? 'unreadable') }); }
    return false;
  };
  const attempt = (context, role, dir, read) => { if (available(context, role, dir)) try { read(); } catch (e) { incomplete.push({ context, role, path: dir, reason: e.code ?? 'unreadable' }); } };
  const walk = (d, each) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) { if (n !== 'node_modules' && n !== '.git') walk(p, each); continue; }
      each(p, n);
    }
  };
  const caseHeader = (p, n) => {
    if (!/^T\d+\.(red|test)\.mjs$/.test(n)) return;
    const h = /^\/\/ Case (\S+) tests: (.*)$/.exec(readFileSync(p, 'utf8').split('\n')[0]);
    if (h) for (const t of h[2].split(',').map((x) => x.trim()).filter((x) => DEFECT.test(x))) (pointing.get(t) ?? pointing.set(t, []).get(t)).push(h[1]);
  };
  for (const { context, defects: dir, architecture = [], cases = [] } of places) {
    if (dir) attempt(context, 'defects', dir, () => {
      for (const n of readdirSync(dir)) {
        if (!n.endsWith('.md')) continue;
        const t = readFileSync(join(dir, n), 'utf8'); const id = t.match(/^id:\s*(\S+)\s*$/m)?.[1];
        if (id) defects.set(id, { context });
      }
    });
    for (const a of architecture) attempt(context, 'architecture', a, () => walk(a, (p, n) => {
      if (!n.endsWith('.md')) return;
      const list = readFileSync(p, 'utf8').match(/^addresses:\s*\[(.*)\]\s*$/m)?.[1] ?? ''; // the Architecture —addresses→ Defect relationship
      for (const id of list.split(',').map((x) => x.trim()).filter((x) => DEFECT.test(x))) { const l = addressedBy.get(id) ?? addressedBy.set(id, []).get(id); if (!l.includes(context)) l.push(context); }
    }));
    for (const c of cases) attempt(context, 'cases', c, () => walk(c, caseHeader));
  }
  return { defects, addressedBy, pointing, incomplete };
}

/**
 * The state of one Defect over a discovered tree. While any location handed over could not be discovered, a Case may be missing from the inventory,
 * so nothing is answered from the Cases found: `answered` becomes `unknown`. A Case found RED still confirms, which needs no complete inventory.
 */
function judge(tree, id, records, revision) {
  const j = judgeDefect(id, tree.pointing.get(id) ?? [], records, revision);
  return tree.incomplete.length && j.state === 'answered' ? { ...j, state: 'unknown' } : j;
}

/** The lines that say discovery was incomplete: `incomplete <role> <path> (<reason>)`, none when every location was discovered. */
export function incompleteLines(tree) {
  return tree.incomplete.map((i) => `incomplete ${i.role} ${i.path} (${i.reason})`);
}

/** One line per Defect record, `<state> <defect>`, then one indented `<case> <outcome>` line per Case that points at it. */
export function report(tree, records, revision) {
  const out = [];
  for (const [id] of [...tree.defects].sort()) {
    const j = judge(tree, id, records, revision);
    out.push(`${j.state} ${id}`);
    for (const c of j.cases) out.push(`  ${c.case} ${c.outcome}`); // each Case's own outcome stays beside the derived state
  }
  return [...out, ...incompleteLines(tree)];
}

/**
 * The unresolved inventory, an input to planning and no order to fix: every Defect record that is not answered, grouped by the context of the
 * Architecture element that addresses it (its correction belongs there), or by the context that holds the Defect while none addresses it.
 * Defect never moves a record and sets nothing; where a correction belongs is Architecture's.
 */
export function toFix(tree, records, revision) {
  const g = {};
  for (const [id, d] of tree.defects) {
    if (judge(tree, id, records, revision).state === 'answered') continue;
    for (const o of tree.addressedBy.get(id) ?? [d.context]) (g[o] ??= []).push(id);
  }
  return g;
}

if (process.argv[1] && process.argv[1].endsWith('known-defects.mjs')) {
  const a = process.argv.slice(2); const opt = (k) => a[a.indexOf(k) + 1];
  const tree = readTree(JSON.parse(readFileSync(opt('--places'), 'utf8')));
  const records = a.includes('--records') ? JSON.parse(readFileSync(opt('--records'), 'utf8')) : [];
  const revision = opt('--revision');
  if (a.includes('--list')) { for (const [o, ds] of Object.entries(toFix(tree, records, revision))) console.log(`${o}: ${ds.join(', ')}`); for (const l of incompleteLines(tree)) console.log(l); }
  else for (const l of report(tree, records, revision)) console.log(l);
  if (tree.incomplete.length) process.exitCode = 2; // incomplete discovery is no complete answer, and an empty output with exit 0 is a verified empty one
}
