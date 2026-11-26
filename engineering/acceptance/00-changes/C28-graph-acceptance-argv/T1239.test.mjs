// Case engineering/T1239 (engineering/C28): the kaal-graph Acceptance test passes no list of Node paths through argv
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'engineering/T1239';
export const tests = ['engineering/D3'];
export const title = 'the kaal-graph Acceptance test hands its child the Node paths by file, not as a command-line argument';

// A child that reads its list from an argument makes the command line grow with the repository; Windows ends it at 32767 characters.
export const readsListFromArgv = (source) => /JSON\.parse\(\s*process\.argv\[\d+\]\s*\)/.test(source);
export const readsListFromFile = (source) => /readFileSync\(\s*process\.argv\[\d+\]/.test(source);

export function run() {
  // The two tests can fail: each side is on the right side of a sample.
  assert.equal(readsListFromArgv('JSON.parse(process.argv[1]).map(f)'), true);
  assert.equal(readsListFromArgv('JSON.parse(readFileSync(process.argv[1], "utf8"))'), false);
  assert.equal(readsListFromFile('JSON.parse(readFileSync(process.argv[1], "utf8"))'), true);
  assert.equal(readsListFromFile('JSON.parse(process.argv[1])'), false);

  const source = readFileSync(join(repo, 'packages/kaal-graph/test/acceptance/graph.test.mjs'), 'utf8');
  assert.equal(readsListFromArgv(source), false, 'the child parses its list of Node paths from a command-line argument');
  assert.equal(readsListFromFile(source), true, 'the child does not read its list of Node paths from a file');
}
