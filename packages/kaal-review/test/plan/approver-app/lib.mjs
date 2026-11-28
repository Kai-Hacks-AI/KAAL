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
/**
 * A stand-in for Hosting's `grantIdentity`: it knows only the grants this file mints and, like Hosting's, throws for anything else, so a copy or a value built by hand is not a grant.
 * The identity is GitHub's own words for the App, its bot login (`<slug>[bot]`), which is also how GitHub names the author of a pull request that App raised.
 */
export const OWN = 'kaal-approver[bot]';
const grants = new WeakMap();
export const mintGrant = (identity = { appId: '1', login: OWN }) => { const g = Object.freeze({ app: 'approver' }); grants.set(g, Object.freeze(identity)); return g; };
export const grantIdentity = (grant) => { const h = grant !== null && typeof grant === 'object' ? grants.get(grant) : undefined; if (!h) throw Object.assign(new Error('the grant was not minted by Hosting'), { code: 'GRANT_UNTRUSTED' }); return h; };
/** A commit as Hosting answers it: its revision and its parents. A pure merge is not an answer of Hosting's; the judgement reads it from the parents. */
export const commit = (sha = HEAD, parents = [BASE, MAIN]) => Object.freeze({ sha, parents: Object.freeze([...parents]) });
/** One run of the check at the head, as Hosting answers it, with GitHub's own words. */
export const RUN = { name: 'verify Sync', revision: HEAD, status: 'completed', conclusion: 'success', signer: 'kaal-inspector' };
/** The facts Hosting produced for the Approver, in the shape of its `readPullRequestFacts`: the head with its parents, the base branch tip, main, the author and `checks`, every run of the named check at the head, newest first, with GitHub's own status and conclusion (`success`), with what a Case changes. */
export function facts(more = {}, origin = { repository: 'r', read: 'readPullRequestFacts', app: 'approver' }) {
  const f = Object.freeze({
    head: commit(), base: Object.freeze({ sha: BASE, ref: 'kaal/review/x' }), main: MAIN, author: Object.freeze({ login: 'someone', type: 'User' }),
    checks: Object.freeze((more.check === null ? [] : [{ ...RUN, ...(more.check ?? {}) }]).map((r) => Object.freeze(r))),
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
