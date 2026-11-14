// Case release/T200 tests: G58
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export const id = 'release/T200';
export const tests = ['release/G58'];
export const title = 'gap release/G58 is closed: every installed pull request template opens its body with the one Change envelope cue, and the SYNC Cases carry no transitional branch';
const DIR = '.github/PULL_REQUEST_TEMPLATE';
const MANDATORY = ['plan', 'do', 'act', 'sync', 'promotion'].map((name) => `${DIR}/${name}.md`).concat('.github/pull_request_template.md');
export async function run() {
  const { stripComments } = await import(pathToFileURL(join(cap, '05-src/plan-body/comments.mjs')).href);
  const dir = join(repo, DIR);
  const discovered = existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.md')).map((name) => `${DIR}/${name}`) : [];
  for (const path of new Set([...MANDATORY, ...discovered])) {
    const file = join(repo, path);
    assert.ok(existsSync(file), `the installed template ${path} is absent`);
    const lines = stripComments(readFileSync(file, 'utf8')).split('\n').map((line) => line.trimEnd()).filter((line) => line !== '');
    assert.equal(lines[0], CUE, `${path} does not open its body with the Change envelope cue`);
    assert.equal(lines.filter((line) => line === CUE).length, 1, `${path} holds the cue more than once`);
  }
  for (const rel of ['03-architecture/A34-sync-template/A37-github/T117.test.mjs', '00-changes/C16-wire-sync-template/T121.test.mjs']) {
    const text = readFileSync(join(cap, rel), 'utf8');
    assert.doesNotMatch(text, /CUE|cue\.mjs|Transitional/, `${rel} still names the cue or keeps the transitional branch`);
  }
}
