// release/C191: judges the complete effective diff of a fast-lane change against a table of lane entries. Pure: the table, the diff and the existing files arrive as data.
// An entry is { kind, roots, name, allow, status? }: the payload kind, the roots the routing declares, the pattern of a file name directly in a root (capture group 1, when present,
// is the uniqueness key, else the whole name), the pattern every root of the kind must match, and the statuses the kind permits (default A and M; an add-only kind says A).
// A diff entry is { path, status, oldPath?, mode? }. The result is { verdict, findings } with verdict qualified, refused, nothing-to-land or unknown. Permission is positive:
// a file qualifies only when exactly one entry matches it and its status is listed there; anything else refuses the whole change.
const REGULAR = '100644';
const PERMITTED = ['A', 'M'];
const RULE_PREFIX = /^(?:\.github\/|\.githooks\/|engineering\/|\.[a-z]+\/)/;
const RULE_SEGMENT = new Set(['lib', 'test', 'scripts', 'skills', 'node_modules', '04-controls', '05-src']);
const unsafe = (path) => typeof path !== 'string' || path === '' || path.startsWith('/') || path.includes('\\') || path.split('/').some((part) => part === '' || part === '.' || part === '..');
const pattern = (value) => {
  if (!(typeof value === 'string' || value instanceof RegExp)) return undefined;
  try { return new RegExp(value); } catch { return undefined; }
};
const covers = (root) => unsafe(root.slice(0, -1)) || !root.endsWith('/') || RULE_PREFIX.test(root) || root.split('/').some((part) => RULE_SEGMENT.has(part));

// null when the table is sound, else the compiled entries
function compile(lanes) {
  if (!Array.isArray(lanes) || lanes.length === 0) return null;
  const kinds = new Set();
  const out = [];
  for (const lane of lanes) {
    if (lane === null || typeof lane !== 'object' || typeof lane.kind !== 'string' || lane.kind === '' || kinds.has(lane.kind)) return null;
    kinds.add(lane.kind);
    const name = pattern(lane.name);
    const allow = pattern(lane.allow);
    const status = lane.status === undefined ? PERMITTED : lane.status;
    if (name === undefined || allow === undefined) return null;
    if (!Array.isArray(status) || status.length === 0 || !status.every((s) => PERMITTED.includes(s))) return null;
    if (!Array.isArray(lane.roots) || lane.roots.length === 0) return null;
    if (!lane.roots.every((root) => typeof root === 'string' && root !== '' && allow.test(root) && !covers(root))) return null;
    out.push({ kind: lane.kind, roots: lane.roots, name, allow, status });
  }
  return out;
}
const keyOf = (entry, file) => { const m = entry.name.exec(file); return m === null ? undefined : (m[1] !== undefined ? m[1] : file); };

export function qualify(diff, { lanes, existing = {} } = {}) {
  const table = compile(lanes);
  if (table === null) return { verdict: 'refused', findings: [{ code: 'roots-cover-rules' }] };
  if (!Array.isArray(diff)) return { verdict: 'unknown', findings: [] };
  if (diff.length === 0) return { verdict: 'nothing-to-land', findings: [] };
  const findings = [];
  const add = (code, path, kind, kinds) => findings.push({ code, path, ...(kind === undefined ? {} : { kind }), ...(kinds === undefined ? {} : { kinds }) });
  // the one entry that matches a path, or undefined after a finding
  const judge = (path) => {
    if (unsafe(path)) { add('outside-roots', path); return undefined; }
    const inRoot = table.map((lane) => ({ lane, root: lane.roots.find((r) => path.startsWith(r)) })).filter((x) => x.root !== undefined);
    if (inRoot.length === 0) { add('outside-roots', path); return undefined; }
    const fits = inRoot.filter(({ lane, root }) => { const rest = path.slice(root.length); return !rest.includes('/') && lane.name.test(rest); });
    if (fits.length === 0) { add('not-an-item', path, inRoot.length === 1 ? inRoot[0].lane.kind : undefined); return undefined; }
    if (fits.length > 1) { add('ambiguous-lane', path, undefined, fits.map((f) => f.lane.kind).sort()); return undefined; }
    return { lane: fits[0].lane, file: path.slice(fits[0].root.length) };
  };
  const held = new Map(table.map((lane) => [lane.kind, new Map()]));
  for (const lane of table) {
    const list = existing !== null && typeof existing === 'object' && Array.isArray(existing[lane.kind]) ? existing[lane.kind] : [];
    for (const p of list) {
      if (typeof p !== 'string') continue;
      const root = lane.roots.find((r) => p.startsWith(r));
      const key = root === undefined ? undefined : keyOf(lane, p.slice(root.length));
      if (key !== undefined) held.get(lane.kind).set(key, p);
    }
  }
  const taken = new Map(table.map((lane) => [lane.kind, new Map()]));
  const entries = diff.map((e) => (e !== null && typeof e === 'object' ? e : {}));
  entries.sort((a, b) => String(a.path).localeCompare(String(b.path)) || String(a.status).localeCompare(String(b.status)));
  for (const e of entries) {
    if (e.status === 'D') { add('deletion', e.path); continue; }
    if (e.status === 'R') {
      add('rename', e.path);
      if (e.oldPath !== undefined) judge(e.oldPath);
      judge(e.path);
      continue;
    }
    const hit = judge(e.path);
    if (hit === undefined) continue;
    const { lane, file } = hit;
    if (e.status === 'T' || (lane.status.includes(e.status) && e.mode !== REGULAR)) { add('mode', e.path, lane.kind); continue; }
    if (!lane.status.includes(e.status)) { add('status', e.path, lane.kind); continue; }
    const key = keyOf(lane, file);
    const other = held.get(lane.kind).get(key);
    const seen = taken.get(lane.kind);
    if ((e.status === 'A' && other !== undefined && other !== e.path) || (seen.has(key) && seen.get(key) !== e.path)) add('duplicate-number', e.path, lane.kind);
    seen.set(key, e.path);
  }
  return { verdict: findings.length === 0 ? 'qualified' : 'refused', findings };
}
