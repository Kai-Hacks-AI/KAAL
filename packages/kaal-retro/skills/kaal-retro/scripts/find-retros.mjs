#!/usr/bin/env node
// Finds the retros in files it is handed. A retro is a Markdown file whose front matter id is <capability>/RT<n>,
// with a format and a non-empty list of Change ids it reflects. It lists what fits and refuses the rest with the
// reason. It only finds: it judges no content, reads no Change and decides nothing.
//
//   node find-retros.mjs <directory>     prints { retros, refused } as JSON; exit 0, or 2 when anything is refused
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ID = /^[a-z][a-z0-9-]*\/RT\d+$/;
const CHANGE = /^[a-z][a-z0-9-]*\/C\d+$/;

export function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, '\n'));
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fields;
}

function reflects(value) {
  const m = /^\[(.*)\]$/.exec(value ?? '');
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : null;
}

export function findRetros(files) {
  const found = [];
  const refused = [];
  for (const file of files) {
    const f = frontmatter(file.text);
    if (!f || !/(^|\/)(RT\d+|4L\.\d+)$/.test(f.id ?? '') && !('format' in f && 'reflects' in f)) continue;
    const list = reflects(f.reflects);
    const reason = !ID.test(f.id ?? '') ? 'id is not <capability>/RT<n>'
      : !f.format ? 'format is missing'
      : list === null ? 'reflects is not a list'
      : list.length === 0 ? 'reflects is empty'
      : list.some((c) => !CHANGE.test(c)) ? 'reflects holds an id that is not a Change id'
      : null;
    if (reason) refused.push({ path: file.path, reason });
    else found.push({ id: f.id, format: f.format, reflects: list, path: file.path });
  }
  const count = {};
  for (const r of found) count[r.id] = (count[r.id] ?? 0) + 1;
  const retros = [];
  for (const r of found) {
    if (count[r.id] > 1) refused.push({ path: r.path, reason: 'duplicate id' });
    else retros.push(r);
  }
  return { retros, refused };
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { if (name !== 'node_modules' && name !== '.git') walk(path, files); }
    else if (name.endsWith('.md')) files.push({ path, text: readFileSync(path, 'utf8') });
  }
  return files;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: find-retros.mjs <directory>'); process.exit(2); }
  const result = findRetros(walk(dir));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.refused.length ? 2 : 0);
}
