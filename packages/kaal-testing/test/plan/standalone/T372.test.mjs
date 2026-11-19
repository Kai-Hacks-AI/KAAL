// Case testing/T372 tests: testing/N32. The installed package names nothing that belongs to a setup outside it.
import assert from 'node:assert/strict';
import { files, install, text } from './lib.mjs';
export const id = 'testing/T372';
export const tests = ['testing/N32'];
export const title = 'the installed package, its Skill and its README name no KAAL repository path, no other package or capability and no role of a setup outside it';
/** Names that come from outside the package. Its own vocabulary (Test Case, Test Plan, Run, Test Step, kaal-testing, KAAL as a brand) is always allowed. */
export const OUTSIDE = [
  [/\b(?:engineering|packages)\//, 'a KAAL repository path'],
  [/\.github\b|\.kaal\//, 'a KAAL repository folder'],
  [/\bkaal-(?!testing\b|hosting\b|foundation\b)[a-z][a-z-]*/, 'another KAAL package or Skill'],
  [/\b(?:Guard|Inspector|Dispatcher|CPO|Engineering)\b/, 'a role or team of a setup outside the package'],
  [/\bFAR\b|\bChange (?:folder|negotiation)\b|\bPROMOTION\b/, 'the process vocabulary of another capability'],
];
export async function run() {
  const { root } = install();
  const found = [];
  for (const f of files(root).filter((n) => /\.(md|mjs|json)$/.test(n) && n !== 'package.json')) {
    text(root, f).split('\n').forEach((line, i) => {
      for (const [re, why] of OUTSIDE) { const m = line.match(re); if (m) found.push(`${f}:${i + 1} "${m[0]}" (${why})`); }
    });
  }
  assert.deepEqual(found, [], `the package names things from outside itself:\n${found.join('\n')}`);
}
