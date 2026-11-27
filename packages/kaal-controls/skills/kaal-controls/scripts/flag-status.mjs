// The flag status report: where every control stands in every place, with the declared decision, the observed signal and the blocking evidence apart. Pure: it reads nothing and decides no verdict.
import { flagState, judgeStamp } from './stamp.mjs';
const TYPES = ['directive', 'preventive', 'detective', 'corrective'];

export function reportFlags({ controls, source, runs } = {}) {
  if (!Array.isArray(controls) || !controls.every((c) => c && typeof c.id === 'string' && TYPES.includes(c.type) && Array.isArray(c.places) && c.places.length > 0 && c.places.every((p) => typeof p === 'string' && p))) throw new Error('reportFlags: controls must be a list of {id, type, places}');
  if (!source || typeof source.of !== 'function') throw new Error('reportFlags: source must be a flag source');
  const facts = runs ?? {};
  const findings = new Set();
  const rows = [];
  for (const c of controls.filter((x) => x.type === 'preventive' || x.type === 'detective')) {
    for (const place of c.places) {
      const flag = source.of(c.id, place) ?? null;
      const state = flag ? flagState(flag.value) : 'UNKNOWN';
      const cause = !flag ? 'no-flag' : state === 'UNKNOWN' ? 'unrecognized-flag' : null;
      const configError = cause && c.type === 'preventive' ? 'preventive-without-flag' : cause;
      const list = (facts[c.id] && facts[c.id][place]) ?? [];
      const s = judgeStamp({ declared: state, runs: list });
      for (const r of s.reasons) findings.add(`${r === 'config-error' ? configError : r}:${c.id}@${place}`);
      const newest = list.length ? list[list.length - 1] : null;
      rows.push({ control: c.id, place, type: c.type, flag, declared: s.declared, observed: s.observed, stamp: s.stamp, blocking: s.blocking, blocked: s.blocked,
        running: list.some((r) => r.verdict !== null && r.verdict !== 'UNKNOWN') ? true : null,
        last: newest ? { run: newest.run, ...(newest.sha ? { sha: newest.sha } : {}) } : null, configError });
    }
  }
  rows.sort((a, b) => (`${a.control}@${a.place}` < `${b.control}@${b.place}` ? -1 : 1));
  if (typeof source.controls === 'function') {
    const known = new Set(rows.map((r) => `${r.control}@${r.place}`));
    for (const k of source.controls()) if (!known.has(k)) findings.add(`orphan-flag:${k}`);
  }
  return { rows, findings: [...findings].sort() };
}

export function renderFlagStatus({ title, rows, findings } = {}) {
  const cell = (v) => (v === null || v === undefined ? '-' : String(v));
  const last = (l) => (l ? `${l.run}${l.sha ? ` (${l.sha})` : ''}` : '-');
  const head = ['Control', 'Place', 'Type', 'Flag', 'Declared', 'Observed', 'STAMP', 'Blocking', 'Blocked', 'Running', 'Last run'];
  const body = rows.map((r) => [r.control, r.place, r.type, cell(r.flag && r.flag.name), cell(r.declared ?? r.configError), cell(r.observed), cell(r.stamp), cell(r.blocking), cell(r.blocked), cell(r.running), last(r.last)]);
  const table = [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...body.map((b) => `| ${b.join(' | ')} |`)].join('\n');
  return [`# ${title}`, '', table, '', '## Findings', '', ...(findings.length ? findings.map((f) => `- ${f}`) : ['None.']), ''].join('\n');
}
