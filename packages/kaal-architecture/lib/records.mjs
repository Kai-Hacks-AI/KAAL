// Mechanics of Architecture records (architecture/F14 to F16). Pure: it reads no file. The caller supplies the text of
// the files it can observe, so the observation boundary is explicit (F15) and the package needs no dependency (N2).
// A record places a correction by addressing a Requirement (F, N) or a Defect (D) in the same field (F17): nothing else is added (N3).

const REF = /^([a-z][a-z0-9-]*)\/([FND])(\d+)$/;
const AID = /^([a-z][a-z0-9-]*)\/A(\d+)$/;

function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const v = kv[2].trim();
    const list = /^\[(.*)\]$/.exec(v);
    out[kv[1]] = list ? list[1].split(',').map((s) => s.trim()).filter(Boolean) : v;
  }
  return out;
}

// F14: reads an A-record by its form. Returns { id, title, addresses, problems }.
export function readRecord(path, text) {
  const problems = [];
  const fm = frontmatter(text);
  if (!fm) return { id: null, title: null, addresses: [], problems: ['no frontmatter'] };
  const id = typeof fm.id === 'string' ? fm.id : null;
  const title = typeof fm.title === 'string' ? fm.title : null;
  const addresses = Array.isArray(fm.addresses) ? fm.addresses : [];
  const m = id && AID.exec(id);
  if (!m) problems.push('id is not <capability>/A<n>');
  if (!title) problems.push('no title');
  if (addresses.length === 0) problems.push('addresses is empty or missing');
  const file = /(?:^|\/)A(\d+)\.md$/.exec(path);
  const folder = /(?:^|\/)03-architecture\/A(\d+)(?:-[^/]*)?\//.exec(path);
  if (!file) problems.push('file is not A<n>.md');
  if (!folder) problems.push('folder is not 03-architecture/A<n>-<slug>');
  if (m && file && file[1] !== m[2]) problems.push(`id number ${m[2]} differs from file A${file[1]}`);
  if (m && folder && folder[1] !== m[2]) problems.push(`id number ${m[2]} differs from folder A${folder[1]}`);
  return { id, title, addresses, problems };
}

// F15: a verdict for each reference inside the observation boundary. `observed` maps each observed capability
// namespace to the Requirement ids (F or N) and Defect ids (D) found in it. Returns the findings only: resolved references give none.
export function checkAddresses(records, observed) {
  const findings = [];
  for (const r of records) {
    if (!r.addresses || r.addresses.length === 0) { findings.push({ id: r.id, ref: null, verdict: 'INVALID' }); continue; }
    for (const ref of r.addresses) {
      const m = REF.exec(ref);
      if (!m) { findings.push({ id: r.id, ref, verdict: 'INVALID' }); continue; }
      const known = observed[m[1]];
      if (!known) findings.push({ id: r.id, ref, verdict: 'UNKNOWN' });
      else if (!known.includes(ref)) findings.push({ id: r.id, ref, verdict: 'INVALID' });
    }
  }
  return findings;
}

// F16: one more than the highest A-number observed in the namespace, 1 when none. It promises no permanence.
export function nextId(namespace, ids) {
  let max = 0;
  for (const id of ids) { const m = AID.exec(id); if (m && m[1] === namespace) max = Math.max(max, Number(m[2])); }
  return `${namespace}/A${max + 1}`;
}

// F18: the records that address an id, in the order handed in. Derived, never stored: a Defect carries no pointer. An id that no record
// addresses is unplaced, and no place is assumed for it. A Defect and its corrections are many to many, so the answer may hold several records.
export function addressing(id, records) {
  return records.filter((r) => Array.isArray(r.addresses) && r.addresses.includes(id)).map((r) => r.id);
}
