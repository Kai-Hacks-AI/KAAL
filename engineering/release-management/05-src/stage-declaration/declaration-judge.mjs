// release/C36: the pure judge of a consumer's Stage declaration (release/F54, release/A50).
// judgeDeclaration([{ name, text }]) -> { structure: 'SOUND' | 'UNSOUND', findings: [string], stages: [names by order],
//   authorization: 'UNKNOWN', readiness: 'UNKNOWN', bindingCoverage: 'UNKNOWN' }.
// A sound structure is not an authorization, not readiness and not a binding verdict; no boolean says otherwise.
const AUTHORITY = ['owner-approval', 'two-person', 'automatic'];
const TRANSITION = ['integrate', 'mark', 'publish', 'install'];
const REQUIRED = ['type', 'order', 'name', 'subject', 'gates', 'authority', 'transition', 'destination'];
const PLATFORM = /(^|[^a-z])(github|githooks|git|npm|npmjs|registry|ruleset|workflow|branch|tag)([^a-z]|$)/i;
const PLAIN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const NAME = /^[A-Z][A-Za-z0-9]*$/;

function parse(text) {
  const m = /^---\n([\s\S]*?)\n---(\n|$)/.exec(text.replace(/\r\n/g, '\n'));
  if (!m) return null;
  const keys = {};
  for (const line of m[1].split('\n')) {
    const k = /^([A-Za-z]+):\s*(.*)$/.exec(line);
    if (!k) return null;
    keys[k[1]] = k[2].trim();
  }
  return keys;
}
const list = (v) => {
  const m = /^\[(.*)\]$/.exec(v ?? '');
  return m ? m[1].split(',').map((x) => x.trim()).filter((x, i, a) => x !== '' || a.length > 1) : null;
};

export function judgeDeclaration(files) {
  const findings = [];
  const stages = [];
  const names = new Set();
  const orders = new Set();
  const parts = new Map();
  for (const f of files ?? []) {
    const at = f?.name ?? 'a Stage file';
    const k = parse(f?.text ?? '');
    if (!k) { findings.push(`${at}: no readable frontmatter`); continue; }
    const missing = REQUIRED.filter((r) => !(r in k) || k[r] === '');
    if (missing.length) { findings.push(`${at}: missing ${missing.join(', ')}`); continue; }
    if (k.type !== 'Release/Stage') findings.push(`${at}: type is ${k.type}, not Release/Stage`);
    const order = Number(k.order);
    if (!Number.isInteger(order) || order < 1) findings.push(`${at}: order ${k.order} is not a positive integer`);
    else if (orders.has(order)) findings.push(`${at}: order ${order} is used twice`);
    else orders.add(order);
    if (!NAME.test(k.name)) findings.push(`${at}: the name ${k.name} is not a plain name`);
    else if (names.has(k.name)) findings.push(`${at}: the name ${k.name} is used twice`);
    else names.add(k.name);
    if (!AUTHORITY.includes(k.authority)) findings.push(`${at}: authority ${k.authority} is unknown`);
    if (!TRANSITION.includes(k.transition)) findings.push(`${at}: transition ${k.transition} is unknown`);
    const gates = list(k.gates);
    if (!gates || gates.length === 0 || gates.some((g) => g === '')) findings.push(`${at}: a Stage needs a non-empty list of gates`);
    else for (const g of gates) if (!PLAIN.test(g)) findings.push(`${at}: the gate "${g}" is not a plain logical name`);
    if (!PLAIN.test(k.destination)) findings.push(`${at}: the destination "${k.destination}" is not a plain logical name`);
    if (!PLAIN.test(k.subject)) findings.push(`${at}: the subject "${k.subject}" is not a plain logical name`);
    for (const key of ['name', 'subject', 'gates', 'destination', 'parts']) {
      if (k[key] && (PLATFORM.test(k[key]) || /[\/*@\\]|\.[a-z]+$/i.test(k[key]))) findings.push(`${at}: ${key} holds platform data: ${k[key]}`);
    }
    if ('parts' in k) {
      const p = list(k.parts);
      if (!p || p.some((x) => x === '' || !NAME.test(x))) findings.push(`${at}: parts must be a list of plain names`);
      else {
        const own = new Set();
        for (const x of p) {
          if (own.has(x)) findings.push(`${at}: the part ${x} is repeated in its Stage`);
          own.add(x);
          if (parts.has(x) && parts.get(x) !== k.name) findings.push(`${at}: the part ${x} is also a part of ${parts.get(x)}`);
          parts.set(x, k.name);
        }
      }
    }
    if (Number.isInteger(order)) stages.push({ order, name: k.name });
  }
  for (const [part, stage] of parts) if (names.has(part)) findings.push(`the part ${part} of ${stage} is named like a Stage`);
  return {
    structure: findings.length ? 'UNSOUND' : 'SOUND',
    findings,
    stages: stages.sort((a, b) => a.order - b.order).map((s) => s.name),
    authorization: 'UNKNOWN',
    readiness: 'UNKNOWN',
    bindingCoverage: 'UNKNOWN',
  };
}
