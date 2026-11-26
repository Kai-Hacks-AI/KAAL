#!/usr/bin/env node
// Finds the controls in a directory. A control is a Markdown file whose frontmatter id is <capability>/CTL<n>.
// It lists every control, complete or not: a control declares id, title, description, type, status and has, and an
// incomplete declaration stays listed with its problems named. It only finds: it resolves no Intent, walks no chain,
// runs no Case and checks no gate.
//
//   node find-controls.mjs [directory]     prints { controls, refused } as JSON
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTROL_ID = /^[a-z][a-z0-9-]*\/CTL\d+$/;
const FIELDS = ['id', 'title', 'description', 'type', 'status', 'has'];
const TYPES = ['directive', 'preventive', 'detective', 'corrective'];

function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, '\n'));
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fields;
}

function idList(value) {
  const m = /^\[(.*)\]$/.exec(value ?? '');
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : null;
}

const STATIONS = ['Developing', 'Collecting', 'Integrating', 'Hotfixing', 'Wiring', 'Promoting', 'Publishing'];
const MODES = ['detective', 'preventive'];
const RATCHET = ['baseline-source', 'owner', 'exit'];
const STATUSES = ['designed', 'implemented', 'running', 'tested'];
const KIND = /^[a-z][a-z0-9-]*$/;
const REF = 'references/declaring-controls.md';
// The baseline file of a ratchet: the files read include it, matched by the path `baseline-source` names. It is a JSON list of unique names.
function baselineProblem(src, files) {
  if (!/\.json$/.test(src) || /\s/.test(src)) return 'baseline-source is not the path of a JSON file';
  const file = files.find((f) => f.path === src || f.path.endsWith('/' + src));
  if (!file) return 'the baseline file is not among the files read';
  let list;
  try { list = JSON.parse(file.text); } catch { return 'the baseline file is not JSON'; }
  if (!Array.isArray(list) || !list.every((x) => typeof x === 'string' && x) || new Set(list).size !== list.length) return 'the baseline file is not a list of unique names';
  return null;
}
const recovery = (field) => field === 'evidence' ? `Write evidence as [<x>:<runs>, ...], the kinds of X the Cases of the control run against, each once, runs a whole number from 1, and at least one entry written <x>:<runs>:fail, an X that is a real failure. See ${REF}.`
  : field === 'stations' ? `Write stations as [<Station>:<mode>, ...] with each station once. Stations: ${STATIONS.join(', ')}. Modes: ${MODES.join(', ')}. A ratchet is no mode: a preventive control declares \`strategy: ratchet\` with ${RATCHET.join(', ')}. See ${REF}.`
  : field === 'strategy' ? `Write \`strategy: ratchet\` only on a preventive control, with ${RATCHET.join(', ')}, or remove the line. See references/modes.md.`
  : field === 'baseline-source' ? `Name the path of the baseline file, a JSON list of unique finding names that the files read include, for example \`baseline-source: <folder>/baseline.json\`. The accepted baseline is read from the base, never from the change under review. See references/modes.md.`
  : RATCHET.includes(field) && field !== 'exit' ? `Add a \`${field}:\` line to a ratchet control, or remove it if the control is no ratchet (\`strategy: ratchet\`). See references/modes.md.`
  : field === 'exit' ? `Add an \`exit:\` line of one sentence saying what the control becomes when its baseline is empty. See references/modes.md.`
  : field === 'status' ? `Add or correct the \`status:\` line as one of ${STATUSES.join(', ')}, as the evidence supports. See ${REF}.`
  : field === 'id' ? `Give the control an id of its own. See ${REF}.`
  : FIELDS.includes(field) ? `Add or correct the \`${field}:\` line. See ${REF}.`
  : `Remove the \`${field}:\` line, a control declares only ${FIELDS.join(', ')}. See ${REF}.`;

export function findControls(files) {
  const candidates = [];
  const cases = [];
  for (const file of files) {
    const text = file.text.replace(/\r\n/g, '\n');
    const header = /^\/\/ Case (\S+) tests: (.*)$/.exec(text.split('\n')[0]);
    if (header) cases.push({ id: header[1], path: file.path, tests: header[2].split(',').map((s) => s.trim()) });
    const fields = frontmatter(text);
    if (fields && CONTROL_ID.test(fields.id ?? '')) candidates.push({ file, fields });
  }
  const count = {};
  for (const { fields } of candidates) count[fields.id] = (count[fields.id] ?? 0) + 1;
  const controls = candidates.map(({ file, fields }) => {
    const has = idList(fields.has);
    const bad = [];
    if (count[fields.id] > 1) bad.push(['id', 'duplicate id']);
    for (const k of FIELDS) if (!fields[k]) bad.push([k, `${k} is missing`]);
    if (fields.type && !TYPES.includes(fields.type)) bad.push(['type', `type is not one of ${TYPES.join(', ')}`]);
    if (fields.status && !STATUSES.includes(fields.status)) bad.push(['status', `status is not one of ${STATUSES.join(', ')}`]);
    if (fields.has && !has?.length) bad.push(['has', 'has lists no Intent']);
    for (const k of Object.keys(fields).filter((k) => !FIELDS.includes(k) && k !== 'stations' && k !== 'evidence' && k !== 'strategy' && !RATCHET.includes(k))) bad.push([k, `${k} is not a field of a control`]);
    let stations = [];
    if (fields.stations !== undefined) {
      const list = idList(fields.stations);
      const parsed = (list ?? []).map((e) => e.split(':').map((x) => x.trim()));
      const ok = list && parsed.every(([st, m, ...r]) => STATIONS.includes(st) && MODES.includes(m) && !r.length) && new Set(parsed.map((q) => q[0])).size === parsed.length;
      if (ok) stations = parsed.map(([station, mode]) => ({ station, mode }));
      else bad.push(['stations', 'stations is not a list of <Station>:<mode>, each station once']);
    }
    if (fields.strategy !== undefined) {
      if (fields.strategy !== 'ratchet') bad.push(['strategy', 'strategy is not ratchet']);
      else if (fields.type !== 'preventive') bad.push(['strategy', 'a ratchet is a strategy of a preventive control']);
      if (fields.strategy === 'ratchet') {
        for (const k of RATCHET) if (!fields[k]) bad.push([k, k === 'exit' ? 'a ratchet has no exit' : `a ratchet has no ${k}`]);
        const why = fields['baseline-source'] && baselineProblem(fields['baseline-source'], files);
        if (why) bad.push(['baseline-source', why]);
      }
    } else for (const k of RATCHET) if (fields[k] !== undefined) bad.push([k, `${k} is declared without strategy: ratchet`]);
    let evidence = [];
    if (fields.evidence !== undefined) {
      const list = idList(fields.evidence);
      const parsed = (list ?? []).map((e) => e.split(':').map((x) => x.trim()));
      const ok = list?.length && parsed.every(([k, n, f, ...r]) => KIND.test(k ?? '') && /^[1-9]\d*$/.test(n ?? '') && (f === undefined || f === 'fail') && !r.length) && new Set(parsed.map((q) => q[0])).size === parsed.length && parsed.some((q) => q[2] === 'fail');
      if (ok) evidence = parsed.map(([kind, runs, f]) => ({ kind, runs: Number(runs), fail: f === 'fail' }));
      else bad.push(['evidence', 'evidence is not a list of <x>:<runs>, each x once, with one :fail entry']);
    }
    const problems = bad.map(([field, reason]) => ({ field, reason, recovery: recovery(field) }));
    const rank = STATUSES.indexOf(fields.status) + 1 || null;
    return { id: fields.id, title: fields.title, description: fields.description, type: fields.type, status: fields.status, rank, stations, evidence, has: has ?? [], path: file.path,
      tests: cases.filter((c) => c.tests.includes(fields.id)).map((c) => ({ id: c.id, path: c.path })), valid: problems.length === 0, problems };
  });
  const refused = controls.filter((c) => !c.valid).map((c) => ({ path: c.path, id: c.id, reason: c.problems[0].reason }));
  return { controls, refused };
}

function gather(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) gather(path, found);
    else if (/\.(md|mjs|json)$/.test(name) && name !== 'package-lock.json') found.push({ path, text: readFileSync(path, 'utf8') });
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(findControls(gather(process.argv[2] ?? '.')), null, 2));
}
