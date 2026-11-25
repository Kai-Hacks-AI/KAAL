// backlog/F4 to F8, N2: judges the complete effective diff of a BACKLOG change. Pure: the diff, the roots and the existing items arrive as data.
// A diff entry is { path, status, oldPath?, mode? } with status A, M, D, R or T; any other or missing status is refused. The result is { verdict, findings } with verdict
// qualified, refused, nothing-to-land or unknown. Permission is positive: only an explicit A or M item file in a root qualifies; anything else refuses the whole change.
const ROOT = /^packages\/[a-z0-9]+(?:-[a-z0-9]+)*\/00-backlog\/$/;
const ITEM = /^B([1-9][0-9]*)(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\.md$/;
const REGULAR = '100644';
const ALLOWED = ['A', 'M'];
const unsafe = (path) => typeof path !== 'string' || path === '' || path.startsWith('/') || path.includes('\\') || path.split('/').some((part) => part === '' || part === '.' || part === '..');
const number = (path) => ITEM.exec(path.slice(path.lastIndexOf('/') + 1))?.[1];

export function qualify(diff, { roots, existing = [] } = {}) {
  if (!Array.isArray(roots) || roots.length === 0 || !roots.every((root) => typeof root === 'string' && ROOT.test(root))) {
    return { verdict: 'refused', findings: [{ code: 'roots-cover-rules' }] };
  }
  if (!Array.isArray(diff)) return { verdict: 'unknown', findings: [] };
  if (diff.length === 0) return { verdict: 'nothing-to-land', findings: [] };
  const findings = [];
  const add = (code, path) => findings.push({ code, path });
  const judge = (path) => {
    if (unsafe(path)) { add('outside-roots', path); return false; }
    const root = roots.find((r) => path.startsWith(r));
    if (root === undefined) { add('outside-roots', path); return false; }
    const rest = path.slice(root.length);
    if (rest.includes('/') || !ITEM.test(rest)) { add('not-an-item', path); return false; }
    return true;
  };
  const held = new Map(existing.filter((p) => typeof p === 'string' && number(p) !== undefined).map((p) => [number(p), p]));
  const taken = new Map();
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
    if (!judge(e.path)) continue;
    if (e.status === 'T' || (ALLOWED.includes(e.status) && e.mode !== REGULAR)) { add('mode', e.path); continue; }
    if (!ALLOWED.includes(e.status)) { add('status', e.path); continue; }
    const n = number(e.path);
    const other = held.get(n);
    if ((e.status === 'A' && other !== undefined && other !== e.path) || (taken.has(n) && taken.get(n) !== e.path)) add('duplicate-number', e.path);
    taken.set(n, e.path);
  }
  return { verdict: findings.length === 0 ? 'qualified' : 'refused', findings };
}
