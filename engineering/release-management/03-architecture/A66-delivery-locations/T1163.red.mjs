// Case release/T1163 tests: release/A66
import assert from 'node:assert/strict';
import { text } from './fixtures.mjs';
export const id = 'release/T1163';
export const tests = ['release/A66'];
export const title = 'no consumer spells a delivery root: both read the declaration through the one reader';
export async function run() {
  const code = (rel) => text(rel).split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
  for (const rel of ['05-src/promotion-raise/final-step.mjs', '05-src/wiring/wire-judge.mjs']) {
    const c = code(rel);
    assert.doesNotMatch(c, /\.github|\.githooks|\.kaal/, rel + ' spells a root');
    assert.match(c, /from '\.\.\/delivery\/locations\.mjs'/, rel + ' does not use the reader');
  }
}
