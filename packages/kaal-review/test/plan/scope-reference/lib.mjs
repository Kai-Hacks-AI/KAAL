// Fixtures and the loader of the planned Cases of review/C7. A fixture is a bare temporary directory: no Git, no station, no layout.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const NAVIGATE = join(PACKAGE, 'skills/kaal-review/scripts/navigate.mjs');

/** The navigation of the delivered package, both of its functions. A Case that finds the behaviour missing is RED by assertion and never a load error. */
export async function load() {
  assert.ok(existsSync(NAVIGATE), 'missing: skills/kaal-review/scripts/navigate.mjs');
  const m = await import(pathToFileURL(NAVIGATE).href);
  for (const name of ['navigate', 'about']) assert.equal(typeof m[name], 'function', `navigate.mjs exports no ${name} function`);
  return m;
}

/** Writes { 'relative/path': text } into a fresh temporary directory and returns its path. */
export function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'review-scope-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

/** A Review item file. `validates` is the scope and `against` the optional reference; an undefined list is left out. */
export function item(id, { validates, against } = {}) {
  const list = (k, a) => (a ? [`${k}: [${a.join(', ')}]`] : []);
  return ['---', `id: ${id}`, ...list('validates', validates), ...list('against', against), '---', `# ${id}`, '',
    '## Question', '', 'Is it so?', '', '## Criteria', '', '- it is so', '', '## Expected evidence', '', '- the thing', ''].join('\n');
}

export const kinds = (nav) => nav.findings.map((f) => f.kind).sort();
