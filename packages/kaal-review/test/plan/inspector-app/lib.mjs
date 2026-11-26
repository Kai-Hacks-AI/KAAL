// Fixtures and the loader of the planned Cases of review/C6. Nothing here reads Git or GitHub, and nothing creates or installs an App.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PACKAGE = join(HERE, '../../..');
const JUDGE = join(PACKAGE, '13-source/scripts/judge-app.mjs');
const DECLARATION = join(PACKAGE, '13-source/github-apps/inspector.json');

/** The judgements of the delivered package. Each Case asserts they exist before it imports them, so on a tree without them a Case is RED by assertion and never a load error. */
export async function load() {
  assert.ok(existsSync(JUDGE), 'missing: 13-source/scripts/judge-app.mjs (the judgements are not delivered yet)');
  const m = await import(pathToFileURL(JUDGE).href);
  for (const name of ['readDeclaration', 'judgeApps', 'judgeWorkflow']) assert.equal(typeof m[name], 'function', `judge-app.mjs exports no ${name} function`);
  return m;
}

/** The text of the declaration of the Inspector in the delivered package. */
export function declarationText() {
  assert.ok(existsSync(DECLARATION), 'missing: 13-source/github-apps/inspector.json (the declaration is not delivered yet)');
  return readFileSync(DECLARATION, 'utf8');
}

/** A workflow that keeps the separation, as text. */
export const WORKFLOW = readFileSync(join(HERE, 'inspector.fixture.yml'), 'utf8');

/** A declaration of an App, with what a Case changes. */
export const declaration = (app, abilities, more = {}) => ({ app, name: `KAAL ${app}`, owner: 'review', purpose: 'a fixture', abilities, ...more });

export const kinds = (verdict) => verdict.findings.map((f) => f.kind).sort();
