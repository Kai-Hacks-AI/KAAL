// Fixtures and the loader of the planned Cases of review/C8. Nothing here reads Git or GitHub, and nothing creates or installs an App.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PACKAGE = join(HERE, '../../..');
const APPS = join(PACKAGE, '13-source/scripts/judge-app.mjs');
const APPROVAL = join(PACKAGE, '13-source/scripts/judge-approval.mjs');
const DECLARATION = join(PACKAGE, '13-source/github-apps/approver.json');
const INSPECTOR = join(PACKAGE, '13-source/github-apps/inspector.json');

/** The judgements of the delivered package. Each Case asserts they exist before it imports them, so on a tree without them a Case is RED by assertion and never a load error. */
export async function load(file, names) {
  assert.ok(existsSync(file), `missing: ${file.slice(PACKAGE.length + 1)} (not delivered yet)`);
  const m = await import(pathToFileURL(file).href);
  for (const name of names) assert.equal(typeof m[name], 'function', `${file.slice(PACKAGE.length + 1)} exports no ${name} function`);
  return m;
}
export const loadApps = () => load(APPS, ['readDeclaration', 'judgeApps']);
export const loadApproval = () => load(APPROVAL, ['judgeApproval']);

/** The text of a declaration in the delivered package. */
export function declarationText(which) {
  const file = which === 'inspector' ? INSPECTOR : DECLARATION;
  assert.ok(existsSync(file), `missing: ${file.slice(PACKAGE.length + 1)} (the declaration is not delivered yet)`);
  return readFileSync(file, 'utf8');
}

export const HEAD = 'a'.repeat(40);
export const BASE = 'b'.repeat(40);
export const MAIN = 'f'.repeat(40);
export const expected = { head: HEAD, base: BASE, main: MAIN, triggers: ['workflow_run'] };
/** Evidence that a pure merge of the base has a passing check signed by the Inspector at the head being decided, from main's code on a trusted trigger, with what a Case changes. */
export const evidence = (more = {}) => ({
  pr: { head: HEAD, base: BASE, author: 'someone', ...(more.pr ?? {}) },
  content: { pureMerge: true, ...(more.content ?? {}) },
  check: { name: 'verify Sync', revision: HEAD, conclusion: 'pass', signer: 'inspector', ...(more.check ?? {}) },
  execution: { trigger: 'workflow_run', codeRevision: MAIN, checkedOutHead: false, ...(more.execution ?? {}) },
});
export const kinds = (answer) => answer.findings.map((f) => f.kind).sort();
