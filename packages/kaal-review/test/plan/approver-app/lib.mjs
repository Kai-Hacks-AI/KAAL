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
export const loadApproval = () => load(APPROVAL, ['judgeApproval', 'makeJudgeApproval']);

/** The text of a declaration in the delivered package. */
export function declarationText(which) {
  const file = which === 'inspector' ? INSPECTOR : DECLARATION;
  assert.ok(existsSync(file), `missing: ${file.slice(PACKAGE.length + 1)} (the declaration is not delivered yet)`);
  return readFileSync(file, 'utf8');
}

export const HEAD = 'a'.repeat(40);
export const BASE = 'b'.repeat(40);
export const MAIN = 'f'.repeat(40);

/**
 * A registry of a Case's own that stands for Hosting's: it registers the facts it mints in a private WeakMap and answers their origin, and answers
 * null for anything else, so a copy, a value rebuilt by hand and a JSON round trip are not recognised. Attribution is never a field of the data.
 */
const registered = new WeakMap();
export const factOrigin = (fact) => (fact !== null && typeof fact === 'object' ? registered.get(fact) ?? null : null);
/** A commit as Hosting answers it: its revision and its parents. A pure merge is not an answer of Hosting's; the judgement reads it from the parents. */
export const commit = (sha = HEAD, parents = [BASE, MAIN]) => Object.freeze({ sha, parents: Object.freeze([...parents]) });
/** The facts Hosting produced for the Approver, in the shape of its `readPullRequestFacts`: the head with its parents, the base branch tip, main, the author and the named check at the head with GitHub's own conclusion (`success`), with what a Case changes. */
export function facts(more = {}, origin = { repository: 'r', read: 'readPullRequestFacts', app: 'approver' }) {
  const f = Object.freeze({
    head: commit(), base: Object.freeze({ sha: BASE, ref: 'kaal/review/x' }), main: MAIN, author: 'someone',
    check: more.check === null ? null : Object.freeze({ name: 'verify Sync', revision: HEAD, conclusion: 'success', signer: 'inspector', ...(more.check ?? {}) }),
    ...Object.fromEntries(Object.entries(more).filter(([k]) => k !== 'check')),
  });
  if (origin) registered.set(f, origin);
  return f;
}
/** What the run claims: the head and base it means to decide on, and execution of the code of main on a trusted trigger without a checkout of the head. */
export const evidence = (more = {}) => ({
  pr: { head: HEAD, base: BASE, ...(more.pr ?? {}) },
  execution: { trigger: 'workflow_run', codeRevision: MAIN, checkedOutHead: false, ...(more.execution ?? {}) },
});
export const kinds = (answer) => answer.findings.map((f) => f.kind).sort();
