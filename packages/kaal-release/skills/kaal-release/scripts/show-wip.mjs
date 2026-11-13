import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
// Show WIP (SWIPE: Show Work In Progress Expectations): a read-only script that shows where each open piece of work is and its expected next move.
// Input: facts about the open pieces and a config (two JSON files). Output: the pieces grouped by station, each as WORK, REVIEW, WAIT or UNKNOWN with a short reason.
// REVIEW pieces also get a reading order and whether each is clean for review now, with the exact head. It reads those two files and nothing else, recommends and authorizes nothing, and gives the same output for the same input. What was not observed is said so, never guessed.
const numberOf = (ref) => Number(String(ref).replace(/\D/g, ''));
const byRef = (a, b) => numberOf(a.ref) - numberOf(b.ref) || String(a.ref).localeCompare(String(b.ref));
const matches = (pattern, value) => pattern === undefined || (value !== undefined && new RegExp(`^${pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`).test(value));

function disposition(p) {
  const work = p.draft ? 'draft'
    : p.review === 'changes' ? 'changes requested'
    : p.threads > 0 ? `${p.threads} unresolved ${p.threads === 1 ? 'thread' : 'threads'}`
    : p.fit === 'conflicts' ? 'conflicts with what it goes into'
    : p.fit === 'behind' ? 'behind what it goes into'
    : p.checks === 'failure' ? 'checks failing'
    : p.review === 'approved' && p.landing === false ? 'approved, not set to land by itself'
    : null;
  if (work) return { disposition: 'WORK', reason: work };
  const missing = ['review', 'threads', 'checks', 'fit'].filter((key) => p[key] === undefined);
  if (p.review === 'approved' && p.landing === undefined) missing.push('landing');
  if (missing.length) return { disposition: 'UNKNOWN', reason: `not observed: ${missing.join(', ')}`, missing };
  if (p.checks === 'pending') return { disposition: 'WAIT', reason: 'checks running' };
  if (p.review !== 'approved') return { disposition: 'REVIEW', reason: 'no approval at the current version' };
  return { disposition: 'WAIT', reason: 'approved, landing on its own' };
}

export function showWip(facts, config) {
  const types = config.types ?? [], entries = config.stations ?? [];
  const typeOf = (title) => { const head = String(title ?? '').split(':')[0].trim(); return String(title ?? '').includes(':') && types.includes(head) ? head : 'unknown'; };
  const stationOf = (p) => entries.find((e) => matches(e.from, p.from) && matches(e.into, p.into))?.station ?? 'unknown station';
  const order = [...new Set(entries.map((e) => e.station)), 'unknown station'];
  const notObserved = [];
  const placed = new Map();
  for (const p of [...(facts.pieces ?? [])].sort(byRef)) {
    const { missing, ...result } = disposition(p);
    if (missing) notObserved.push(`${p.ref}: ${missing.join(', ')} not observed`);
    const station = stationOf(p);
    if (!placed.has(station)) placed.set(station, []);
    placed.get(station).push({ ref: p.ref, type: typeOf(p.title), from: p.from, into: p.into, ...result });
  }
  notObserved.push(...(facts.gaps ?? []));
  const stations = order.filter((s) => placed.has(s)).map((station) => ({ station, pieces: placed.get(station) }));
  return { stations, notObserved, review: reviewSequence(facts.pieces ?? [], stations, order, config, typeOf, stationOf) };
}

// The pieces that wait for a reviewer, in reading order, each clean, not clean or unknown for review at this moment.
function reviewSequence(pieces, stations, order, config, typeOf, stationOf) {
  const rules = config.review, listedStations = rules?.stations ?? [], listedTypes = rules?.types ?? [];
  const waiting = new Set(stations.flatMap((s) => s.pieces).filter((p) => p.disposition === 'REVIEW').map((p) => p.ref));
  const stationRank = (p) => { const name = stationOf(p), at = listedStations.indexOf(name); return at >= 0 ? at : listedStations.length + order.indexOf(name); };
  const typeRank = (p) => { if (!rules) return 0; const type = typeOf(p.title), at = listedTypes.indexOf(type); return at >= 0 ? at : listedTypes.length + (type === 'unknown' ? 1 : 0); };
  const ahead = (p) => pieces.filter((q) => q !== p && rules?.sync && typeOf(q.title) === rules.sync && (q.into === p.from || q.into === p.into));
  return pieces.filter((p) => waiting.has(p.ref))
    .sort((a, b) => stationRank(a) - stationRank(b) || typeRank(a) - typeRank(b) || byRef(a, b))
    .map((p, i) => {
      const reasons = [];
      if (p.checks === 'none') reasons.push('checks reported nothing');
      for (const q of ahead(p)) reasons.push(`sync ${q.ref} pending into ${q.into}`);
      if (p.head === undefined) reasons.push('head not observed');
      const clean = reasons.some((r) => r !== 'head not observed') ? false : p.head === undefined ? 'unknown' : true;
      return { rank: i + 1, ref: p.ref, type: typeOf(p.title), from: p.from, into: p.into, head: p.head, clean, reasons };
    });
}

export function render(report) {
  const lines = [];
  for (const { station, pieces } of report.stations) {
    lines.push(station, ...pieces.map((p) => `${p.ref} ${p.type} ${p.from} → ${p.into} ${p.disposition} ${p.reason}`), '');
  }
  if (report.notObserved.length) lines.push('not observed:', ...report.notObserved.map((n) => `- ${n}`));
  if (report.review) {
    lines.push('', 'Review sequence');
    if (!report.review.length) lines.push('nothing waits for review');
    for (const r of report.review) {
      const status = r.clean === true ? 'CLEAN' : `${r.clean === false ? 'NOT CLEAN' : 'UNKNOWN'} ${r.reasons.join('; ')}`;
      lines.push(`${r.rank}. ${r.ref} ${r.type} ${r.from} → ${r.into} @${r.head === undefined ? 'unknown' : String(r.head).slice(0, 7)} ${status}`);
    }
  }
  return lines.join('\n').trimEnd() + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [factsFile, configFile] = process.argv.slice(2);
    process.stdout.write(render(showWip(JSON.parse(readFileSync(factsFile, 'utf8')), JSON.parse(readFileSync(configFile, 'utf8')))));
  } catch (error) { console.error(String(error.message)); process.exitCode = 2; }
}
