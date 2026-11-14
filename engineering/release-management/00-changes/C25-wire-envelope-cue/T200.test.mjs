// Case release/T200 tests: G58
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PAIRS } from './pairs.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export const id = 'release/T200';
export const tests = ['release/G58'];
export const title = 'gap release/G58 is closed at the source: each of the six template sources opens with the one cue and equals the installed template once the cue line is taken out';
const withoutCue = (text) => text.split('\n').filter((line) => line !== CUE).join('\n').replace(/\n\n\n+/g, '\n\n').replace(/^\n+/, '');
export async function run() {
  const { stripComments } = await import(pathToFileURL(join(cap, '05-src/plan-body/comments.mjs')).href);
  for (const [source, installed] of PAIRS) {
    const path = join(cap, source);
    assert.ok(existsSync(path), `the Engineering source ${source} is absent`);
    const text = readFileSync(path, 'utf8');
    const lines = stripComments(text).split('\n').map((line) => line.trimEnd()).filter((line) => line !== '');
    assert.equal(lines[0], CUE, `${source} does not open its body with the Change envelope cue`);
    assert.equal(lines.filter((line) => line === CUE).length, 1, `${source} holds the cue more than once`);
    const target = join(repo, installed);
    assert.ok(existsSync(target), `the installed template ${installed} is absent`);
    // Content is retained: apart from the cue line, the source is the installed file (whether or not the installed one has the cue yet).
    assert.equal(withoutCue(text), withoutCue(readFileSync(target, 'utf8')), `${source} differs from ${installed} by more than the cue`);
  }
}
