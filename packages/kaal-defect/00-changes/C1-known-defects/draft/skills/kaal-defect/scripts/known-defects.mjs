#!/usr/bin/env node
// known-defects: derive each Defect's state from the Test Cases that point at it, as Controls derive a status from the Cases of a control.
// A Defect holds no state. Edges run from a Case to a Defect (the Case's first line `// Case <id> tests: <defect id>`).
// A record is { case, run, revision, outcome, covers }, outcome GREEN, RED or UNKNOWN as a Case runner reports it, and `covers` the
// parts of the Defect's claimed reach that run covered (as a control's record carries the kind of X it ran against). The runner is Testing's; nothing here runs a Case.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const DEFECT = /^[a-z][a-z0-9-]*\/D[1-9][0-9]*$/;
const OUTCOMES = new Set(['GREEN', 'RED', 'UNKNOWN']);

/** What one Case shows at `revision`: RED if any applicable run is RED, GREEN if every applicable run is GREEN, otherwise UNKNOWN. */
function caseOutcome(id, records, revision) {
  const mine = records.filter((r) => r.case === id && r.revision === revision);
  const o = mine.map((r) => (OUTCOMES.has(r.outcome) ? r.outcome : 'UNKNOWN'));
  return o.includes('RED') ? 'RED' : o.length && o.every((x) => x === 'GREEN') ? 'GREEN' : 'UNKNOWN';
}

const norm = (p) => (p === '.' ? '.' : p.replace(/\/+$/, ''));
/** A covered part covers a claimed part when they are the same, when the claimed part lies under it, or when it is the whole repository. */
const covers = (c, part) => norm(c) === '.' || norm(c) === norm(part) || norm(part).startsWith(`${norm(c)}/`);

/**
 * The derived state of a Defect, from the Cases that point at it, at one revision.
 * confirmed: some applicable Case is RED, even if every other Case is UNKNOWN. answered: it has Cases, every applicable Case is GREEN with
 * complete evidence, and every part of its claimed reach is covered by a GREEN applicable record. Otherwise unknown: no Case, a stale or
 * UNKNOWN result, an unclaimed reach, or a part of the claimed reach that no Case covers. UNKNOWN is never RED and never GREEN.
 */
export function judgeDefect(defect, cases, records = [], revision, reach = []) {
  const o = cases.map((c) => caseOutcome(c, records, revision));
  const greens = records.filter((r) => cases.includes(r.case) && r.revision === revision && r.outcome === 'GREEN');
  const uncovered = reach.filter((part) => !greens.some((r) => (r.covers ?? []).some((c) => covers(c, part))));
  const state = o.includes('RED') ? 'confirmed' : o.length && o.every((x) => x === 'GREEN') && reach.length && !uncovered.length ? 'answered' : 'unknown';
  return { id: defect, state, cases: cases.map((c, i) => ({ case: c, outcome: o[i] })), reached: reach.length > 0, uncovered };
}

/** Defect records, registers and the Cases that point at a Defect, read from a tree. */
export function readTree(root) {
  const defects = new Map(); // id -> { context, placed }
  const registered = new Map(); // id -> context
  const pointing = new Map(); // defect id -> [case ids]
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) { if (n !== 'node_modules' && n !== '.git') walk(p); continue; }
      const text = () => readFileSync(p, 'utf8');
      if (/\/(?:\d+-)?defects\/known\.json$/.test(p)) {
        const context = relative(root, dirname(dirname(p))) || '.';
        for (const id of JSON.parse(text())) registered.set(id, context);
      } else if (/\/(?:\d+-)?defects\/[^/]+\.md$/.test(p)) {
        const t = text(); const id = t.match(/^id:\s*(\S+)\s*$/m)?.[1];
        if (id) defects.set(id, { context: relative(root, dirname(dirname(p))) || '.', placed: t.match(/^placed:\s*(.+?)\s*$/m)?.[1], reach: (t.match(/^reach:\s*(.+?)\s*$/m)?.[1] ?? '').split(',').map((x) => x.trim()).filter(Boolean) });
      } else if (/\/T\d+\.(red|test)\.mjs$/.test(p)) {
        const h = /^\/\/ Case (\S+) tests: (.*)$/.exec(text().split('\n')[0]);
        if (h) for (const t of h[2].split(',').map((s) => s.trim()).filter((s) => DEFECT.test(s))) (pointing.get(t) ?? pointing.set(t, []).get(t)).push(h[1]);
      }
    }
  };
  walk(root);
  return { defects, registered, pointing };
}

const valid = (tree, id) => tree.defects.get(id)?.context === tree.registered.get(id);

/** One line per Defect record, `<state> <defect>` and ` known` when its own context registers it, then one indented `<case> <outcome>` line per Case that points at it; `invalid <defect>` for a registered id with no record in that context. */
export function report(tree, records, revision) {
  const out = [];
  for (const [id] of [...tree.defects].sort()) {
    const j = judgeDefect(id, tree.pointing.get(id) ?? [], records, revision, tree.defects.get(id).reach);
    out.push(`${j.state} ${id}${tree.registered.has(id) && valid(tree, id) ? ' known' : ''}`);
    for (const c of j.cases) out.push(`  ${c.case} ${c.outcome}`); // each Case's own outcome stays beside the derived state
    if (!j.reached) out.push('  reach unclaimed');
    for (const part of j.uncovered) out.push(`  uncovered ${part}`); // a claimed part no GREEN Case covers: it counts toward unknown
  }
  for (const [id] of tree.registered) if (!valid(tree, id)) out.push(`invalid ${id}`);
  return out;
}

/** What each owner has to fix: registered Defects that are not answered, grouped by `placed`, or by the holding context while there is none. */
export function toFix(tree, records, revision) {
  const g = {};
  for (const [id] of tree.registered) {
    const d = tree.defects.get(id);
    if (!d || !valid(tree, id) || judgeDefect(id, tree.pointing.get(id) ?? [], records, revision, d.reach).state === 'answered') continue;
    (g[d.placed ?? d.context] ??= []).push(id);
  }
  return g;
}

if (process.argv[1] && process.argv[1].endsWith('known-defects.mjs')) {
  const a = process.argv.slice(2); const opt = (k) => a[a.indexOf(k) + 1];
  const tree = readTree(opt('--root'));
  const records = a.includes('--records') ? JSON.parse(readFileSync(opt('--records'), 'utf8')) : [];
  const revision = opt('--revision');
  if (a.includes('--list')) { for (const [o, ds] of Object.entries(toFix(tree, records, revision))) console.log(`${o}: ${ds.join(', ')}`); }
  else for (const l of report(tree, records, revision)) console.log(l);
}
