// Reads a rehearsal record: front matter, `## Section`s, `key: value` fields, and `- key: value` entries with indented continuation lines.
const kv = (s) => { const i = s.indexOf(': '); return i < 0 ? null : [s.slice(0, i).trim(), s.slice(i + 2).trim()]; };
export function parse(text) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(String(text));
  if (!m) return null;
  const front = {};
  for (const l of m[1].split('\n')) { const p = kv(l); if (p) front[p[0]] = p[1]; }
  const sections = {};
  let cur = null; let ent = null;
  for (const l of m[2].split('\n')) {
    const h = /^## (.+)$/.exec(l);
    if (h) { cur = sections[h[1].trim()] = { fields: {}, entries: [] }; ent = null; continue; }
    if (!cur) continue;
    if (l.startsWith('- ')) { ent = {}; cur.entries.push(ent); const p = kv(l.slice(2)); if (p) ent[p[0]] = p[1]; }
    else if (l.startsWith('  ') && ent) { const p = kv(l.trim()); if (p) ent[p[0]] = p[1]; }
    else { const p = kv(l); if (p) cur.fields[p[0]] = p[1]; }
  }
  return { front, sections };
}
