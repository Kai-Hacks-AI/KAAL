#!/usr/bin/env node
// Finds the controls in a repository. A control is a Markdown file whose frontmatter id is <capability>/CTL<n>
// and whose frontmatter holds exactly id, title, description and has. It only finds: it resolves no Intent,
// walks no chain, runs no Case and checks no gate.
//
//   node find-controls.mjs [directory]     prints { controls, refused } as JSON
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTROL_ID = /^[a-z][a-z0-9-]*\/CTL\d+$/;
const FIELDS = ['id', 'title', 'description', 'has'];

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

// files: [{ path, text }]. Returns { controls, refused }. Pure: it reads nothing and imports nothing.
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
  const controls = [];
  const refused = [];
  for (const { file, fields } of candidates) {
    const missing = FIELDS.find((k) => !fields[k]);
    const has = idList(fields.has);
    const extra = Object.keys(fields).filter((k) => !FIELDS.includes(k));
    const reason = count[fields.id] > 1 ? 'duplicate id'
      : missing ? `${missing} is missing`
      : !has?.length ? 'has lists no Intent'
      : extra.length ? `${extra.join(', ')} is not a field of a control`
      : null;
    if (reason) { refused.push({ path: file.path, id: fields.id, reason }); continue; }
    controls.push({
      id: fields.id, title: fields.title, description: fields.description, has, path: file.path,
      tests: cases.filter((c) => c.tests.includes(fields.id)).map((c) => ({ id: c.id, path: c.path })),
    });
  }
  return { controls, refused };
}

function gather(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) gather(path, found);
    else if (/\.(md|mjs)$/.test(name)) found.push({ path, text: readFileSync(path, 'utf8') });
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(findControls(gather(process.argv[2] ?? '.')), null, 2));
}
