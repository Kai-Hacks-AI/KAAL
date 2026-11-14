// Case release/T198 tests: G56
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export const id = 'release/T198';
export const tests = ['release/G56'];
export const title = 'gap release/G56 is closed: every pull request template opens its body with the one Change envelope cue, as the envelope judge reads visible text';
// Mandatory locations, named. A missing one fails the Case: no count can stand in for them.
const MANDATORY = [
  '.github/PULL_REQUEST_TEMPLATE/plan.md',
  '.github/PULL_REQUEST_TEMPLATE/do.md',
  '.github/PULL_REQUEST_TEMPLATE/act.md',
  '.github/PULL_REQUEST_TEMPLATE/sync.md',
  '.github/PULL_REQUEST_TEMPLATE/promotion.md',
  '.github/pull_request_template.md',
  'engineering/release-management/03-architecture/A41-fallback-template/fallback-template.md',
];
// Every other template is discovered: any .md file in the template directory, so one that lands later is judged too.
function discovered() {
  const dir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
  return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.md')).map((name) => `.github/PULL_REQUEST_TEMPLATE/${name}`) : [];
}
export async function run() {
  // The visible text is read by the same function the envelope judge uses, not by a copy.
  const { stripComments } = await import(pathToFileURL(join(cap, '05-src/plan-body/comments.mjs')).href);
  const envelope = await import(pathToFileURL(join(cap, '05-src/plan-body/envelope.mjs')).href);
  for (const path of MANDATORY) assert.ok(existsSync(join(repo, path)), `the mandatory template ${path} is absent`);
  for (const path of new Set([...MANDATORY, ...discovered()])) {
    const lines = stripComments(readFileSync(join(repo, path), 'utf8')).split('\n').map((line) => line.trimEnd()).filter((line) => line !== '');
    assert.equal(lines[0], CUE, `${path} does not open its body with the Change envelope cue`);
    assert.equal(lines.filter((line) => line === CUE).length, 1, `${path} holds the cue more than once`);
  }
  assert.equal(envelope.CUE, CUE, 'the envelope judge does not export the cue it accepts, or accepts another one');
}
