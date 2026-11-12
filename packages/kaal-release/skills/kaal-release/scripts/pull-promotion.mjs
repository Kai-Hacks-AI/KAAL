// pull Promotion: says whether one collector is READY, BLOCKED or NOT JUDGED for promotion.
// Read-only and deterministic. It reads facts, a declaration and the findings of the flow as data, never the host,
// and it never imports the flow script: the two meet in data only. Missing evidence is UNKNOWN and never passes.
// It recommends a next action and authorizes or executes nothing.
// Usage: node pull-promotion.mjs <facts.json> <declaration.json> <flow.json> <collector>
import { readFileSync } from 'node:fs';
const ORDER = ['lifecycle', 'verification', 'protection', 'sequencing', 'validation', 'attribution'];
const uniq = (a) => [...new Set(a)].sort();
const worst = (s) => (s.includes('FAIL') ? 'FAIL' : s.includes('UNKNOWN') ? 'UNKNOWN' : 'PASS');

export function pullPromotion(facts, declaration, flow, collectorName) {
  const rd = declaration.readiness ?? {};
  const owners = rd.owners ?? {};
  const roles = declaration.roles;
  const notJudged = [];
  const col = (facts.collectors ?? []).find((c) => c.name === collectorName);
  if (!col) throw new Error(`the collector ${collectorName} is not in the facts`);
  const pieces = facts.pieces ?? [];
  const J = Object.fromEntries(ORDER.map((id) => [id, { id, owner: owners[id], status: 'PASS', because: '', evidence: [], missing: [] }]));
  const set = (id, status, because, evidence = [], missing = []) => {
    const j = J[id];
    j.status = worst([j.status, status]);
    if (status !== 'PASS') { j.because = [j.because, because].filter(Boolean).join('; '); }
    j.evidence = uniq([...j.evidence, ...evidence]); j.missing = uniq([...j.missing, ...missing]);
  };
  const changes = [];
  if (!rd.lifecycle) set('lifecycle', 'UNKNOWN', 'no lifecycle is declared', [], ['lifecycle declaration']);
  else {
    const dels = (facts.deliveries ?? []).filter((d) => d.collector === collectorName);
    let since = null; let timeUnknown = false;
    if (dels.length) { if (dels.some((d) => !d.landedAt)) timeUnknown = true; else since = dels.map((d) => d.landedAt).sort().pop(); }
    const mine = pieces.filter((p) => p.into === collectorName && p.state !== 'dropped');
    const inColl = [];
    let unplaced = false;
    for (const p of mine) {
      if (p.state === 'open') { inColl.push(p); continue; }
      if (since === null && !timeUnknown) inColl.push(p);
      else if (timeUnknown || !p.landedAt) { unplaced = true; set('lifecycle', 'UNKNOWN', `${p.ref} cannot be placed against the last delivery`, [], [p.ref]); }
      else if (p.landedAt > since) inColl.push(p);
    }
    const ids = uniq(inColl.map((p) => p.change));
    if (!ids.length && !unplaced) set('lifecycle', 'UNKNOWN', 'no Change is in the collector since its last delivery', [], ['a Change in the collector']);
    for (const id of ids) {
      const landedTypes = new Set(inColl.filter((p) => p.change === id && p.state === 'landed').map((p) => p.type));
      const open = inColl.filter((p) => p.change === id && p.state === 'open');
      const missing = uniq(rd.lifecycle.filter((t) => !landedTypes.has(t)));
      const c = { id, status: missing.length || open.length ? 'incomplete' : 'complete', missing };
      const leg = (rd.legacy ?? []).find((l) => l.change === id);
      if (leg) { c.legacy = true; c.legacyReason = leg.reason; }
      changes.push(c);
      if (missing.length && !unplaced) set('lifecycle', 'FAIL', `${id} lacks ${missing.join(', ')} in the collector`, [id]);
      if (open.length) set('lifecycle', 'FAIL', `${open.map((p) => p.ref).join(', ')} of ${id} not landed yet`, open.map((p) => p.ref));
      for (const p of inColl.filter((q) => q.change === id && q.state === 'landed')) {
        if (!('review' in p) || p.review === null) set('validation', 'UNKNOWN', `${p.ref} has no review fact`, [], [p.ref]);
        else if (p.review.state !== 'approved') set('validation', 'FAIL', `${p.ref} has ${p.review.state}`, [p.ref]);
        else if (p.review.at !== p.at) set('validation', 'FAIL', `${p.ref} was approved at ${p.review.at}, older than what landed`, [p.ref]);
      }
    }
    changes.sort((a, b) => (a.id < b.id ? -1 : 1));
    // dependencies
    for (const d of (rd.dependencies ?? []).filter((x) => ids.includes(x.change))) for (const on of d.on) {
      const xc = (facts.collectors ?? []).find((c) => c.name === on.collector);
      if (!xc) set('sequencing', 'UNKNOWN', `${on.collector} (${on.change}) is not in the facts`, [], [on.collector]);
      else if (!(facts.deliveries ?? []).some((q) => q.collector === on.collector && q.delivered === xc.at)) set('sequencing', 'FAIL', `${on.change} in ${on.collector} is not delivered at its current version`, [on.change]);
    }
  }
  // checks
  const promo = pieces.find((p) => p.type === (declaration.types?.promotion ?? 'PROMOTION') && p.state === 'open' && p.from === collectorName);
  const checks = promo ? promo.checks : col.checks;
  const owned = rd.checkOwners ?? {};
  if (!checks) for (const id of uniq(Object.values(owned))) set(id, 'UNKNOWN', 'no check evidence', [], uniq(Object.entries(owned).filter(([, v]) => v === id).map(([k]) => k)));
  else {
    const byName = new Map();
    for (const c of checks) { const l = byName.get(c.name) ?? []; l.push(c.conclusion); byName.set(c.name, l); }
    for (const [name, id] of Object.entries(owned)) {
      const l = byName.get(name);
      if (!l) set(id, 'UNKNOWN', `${name} has no run`, [], [name]);
      else if (new Set(l).size > 1) set(id, 'UNKNOWN', `${name} is reported twice with different conclusions`, [], [name]);
      else if (l[0] === 'success') set(id, 'PASS', '', []);
      else if (l[0] === 'failure') set(id, 'FAIL', `${name} failed`, [name]);
      else set(id, 'UNKNOWN', `${name} is ${l[0]}`, [], [name]);
    }
    for (const name of [...byName.keys()].sort()) if (!(name in owned)) { notJudged.push({ subject: name, missing: 'an owner in the declaration' }); set('attribution', 'UNKNOWN', `${name} has no declared owner`, [], [name]); }
  }
  // sequencing
  if (col.behindTarget === undefined) set('sequencing', 'UNKNOWN', 'the distance to the target is unknown', [], ['behindTarget']);
  else if (col.behindTarget > 0) set('sequencing', 'FAIL', `the collector is ${col.behindTarget} behind the target`);
  // gaps: what the supplier or the flow could not read. A gap that bears on a judgment makes that judgment UNKNOWN; any other stays visible and blocks nothing
  const changeIds = changes.map((c) => c.id);
  const relevance = (g) => {
    if (g.affects !== undefined) return ORDER.includes(g.affects) ? { id: g.affects, by: 'declared by the supplier' } : { id: 'attribution', by: `affects names ${JSON.stringify(g.affects)}, which is not a judgment` };
    if (g.subject === collectorName) return { id: 'sequencing', by: 'it is a fact about the collector itself' };
    if (g.subject in owned) return { id: owned[g.subject], by: 'it is a check with a declared owner' };
    const piece = pieces.find((p) => p.ref === g.subject);
    if (piece && (changeIds.includes(piece.change) || piece.into === collectorName || piece.from === collectorName)) return { id: 'lifecycle', by: 'it is a piece of a Change judged here' };
    return null;
  };
  for (const g of [...(facts.gaps ?? []), ...(flow?.notJudged ?? [])]) {
    const hit = relevance(g);
    if (!hit) { notJudged.push({ ...g, affects: null, blocking: false }); continue; }
    set(hit.id, 'UNKNOWN', `${g.subject}: ${g.missing}`, [], [g.subject]);
    notJudged.push({ ...g, affects: hit.id, blocking: true, because: hit.by });
  }
  const judgments = ORDER.map((id) => {
    const j = J[id];
    // keep only the evidence that explains a non-pass
    return { ...j, evidence: j.status === 'PASS' ? [] : j.evidence };
  });
  const statuses = judgments.map((j) => j.status);
  const verdict = statuses.includes('FAIL') ? 'BLOCKED' : statuses.includes('UNKNOWN') ? 'NOT JUDGED' : 'READY';
  // turn
  const lane = flow?.lane;
  const turn = !lane ? { status: 'not judged' } : lane.active === collectorName ? { status: 'active' } : { status: 'waiting', on: lane.active };
  // next
  let next;
  const hold = (declaration.holds ?? []).find((h) => h.target === promo?.ref || h.target === collectorName);
  const finding = promo && (flow?.actions ?? []).find((a) => a.target === promo.ref);
  if (hold) next = { action: 'WAIT', target: promo?.ref ?? collectorName, status: 'escalate', authority: roles?.owner, reason: hold.reason, source: 'declaration' };
  else if (verdict === 'READY' && finding) next = { action: finding.action, target: finding.target, status: finding.status, authority: finding.authority, reason: finding.reason, source: 'flow' };
  else if (verdict === 'READY' && turn.status === 'active') next = { action: 'OPEN', kind: 'promotion', target: collectorName, status: 'ready', authority: roles?.author, reason: 'every judgment passes and the lane is this collector\'s', source: 'readiness' };
  else if (verdict === 'READY' && turn.status === 'waiting') next = { action: 'WAIT', target: collectorName, status: 'waiting', dependency: `the promotion of ${turn.on}`, reason: 'ready, and the lane is not its own', source: 'readiness' };
  else if (verdict === 'READY') next = { action: null, missing: ['lane'], reason: 'ready, and the lane is not known', source: 'readiness' };
  else if (verdict === 'BLOCKED') next = { action: 'REVISE', target: collectorName, status: 'blocked', authority: roles?.author, reason: judgments.filter((j) => j.status === 'FAIL').map((j) => `${j.owner}: ${j.because}`).join('; '), source: 'readiness' };
  else next = { action: null, status: 'waiting', missing: uniq(judgments.flatMap((j) => j.missing.map((m) => `${j.owner}: ${m}`))), reason: 'evidence is missing', source: 'readiness' };
  if (!roles) notJudged.push({ subject: 'declaration', missing: 'roles' });
  return { collector: collectorName, verdict, judgments, changes, turn, next, notJudged };
}

if (process.argv[1] && process.argv[1].endsWith('pull-promotion.mjs') && process.argv.length >= 6) {
  const read = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { process.stderr.write(`could not read ${f}: ${e.message}\n`); process.exit(2); } };
  const [, , f, d, fl, c] = process.argv;
  const out = (() => { try { return pullPromotion(read(f), read(d), read(fl), c); } catch (e) { process.stderr.write(`${e.message}\n`); process.exit(2); } })();
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}
