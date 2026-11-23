// Fixtures and the loader of the planned Cases of review/C5. A fixture is a bare temporary directory: no Git, no station, no layout.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const NAVIGATE = join(PACKAGE, 'skills/kaal-review/scripts/navigate.mjs');

/** The navigation of the delivered package. Each Case asserts it exists before it imports it, so on a tree without it a Case is RED by assertion and never a load error. */
export async function load() {
  assert.ok(existsSync(NAVIGATE), 'missing: skills/kaal-review/scripts/navigate.mjs (the navigation is not delivered yet)');
  const m = await import(pathToFileURL(NAVIGATE).href);
  assert.equal(typeof m.navigate, 'function', 'navigate.mjs exports no navigate function');
  return m.navigate;
}

/** Writes { 'relative/path': text } into a fresh temporary directory and returns its path. */
export function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'review-items-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const list = (a) => `[${a.join(', ')}]`;
/** A Review item file. Pass a chapter as undefined to leave it out. */
export function item(id, o = {}) {
  const { validates } = o;
  const pick = (k, d) => (k in o ? o[k] : d);
  const question = pick('question', 'Is it so?'), criteria = pick('criteria', ['it is so']), evidence = pick('evidence', ['the document']);
  const front = ['---', `id: ${id}`, ...(validates ? [`validates: ${list(validates)}`] : []), '---', `# ${id}`, ''];
  const ch = (name, v) => (v === undefined ? [] : [`## ${name}`, '', ...(Array.isArray(v) ? v.map((x) => `- ${x}`) : [v]), '']);
  return [...front, ...ch('Question', question), ...ch('Criteria', criteria), ...ch('Expected evidence', evidence)].join('\n');
}

/** A Review result file. fields are the front matter; execution and result are the chapters (undefined leaves the chapter out). */
export function result(id, fields, o = {}) {
  const execution = 'execution' in o ? o.execution : 'Read the document.';
  const res = 'result' in o ? o.result : 'It holds.';
  const lines = ['---', `id: ${id}`];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    if (Array.isArray(v) && k === 'parts') lines.push('parts:', ...v.map((x) => `  - ${x}`));
    else lines.push(`${k}: ${v}`);
  }
  lines.push('---', `# ${id}`, '', '## Execution', '', execution, '');
  if (res !== undefined) lines.push('## Result', '', res, '');
  return lines.join('\n');
}

/** Every key at any depth of a value. */
export function keys(v, out = new Set()) {
  if (Array.isArray(v)) v.forEach((x) => keys(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out.add(k); keys(x, out); }
  return out;
}
export const kinds = (nav) => nav.findings.map((f) => f.kind).sort();
