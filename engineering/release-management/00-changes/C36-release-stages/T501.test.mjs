// Case release/T501 tests: F54
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T501';
export const tests = ['release/F54'];
export const title = 'a Stage declaration holds no platform data: no platform word, no path, no glob pattern, no branch or check name';

const file = (destination, gate = 'checked') => ({ name: 'S', text: `---\ntype: Release/Stage\norder: 1\nname: Build\nsubject: candidate\ngates: [${gate}]\nauthority: owner-approval\ntransition: integrate\ndestination: ${destination}\n---\nbody\n` });

export async function run() {
  const src = join(repo, 'engineering/release-management/05-src/stage-declaration/declaration-judge.mjs');
  assert.ok(existsSync(src), 'the declaration judge is absent from the Engineering sources');
  const { judgeDeclaration } = await import(pathToFileURL(src).href);
  assert.equal(judgeDeclaration([file('next-line')]).structure, 'SOUND');
  for (const bad of ['GitHub-ruleset', 'githooks', 'npm-registry', 'kaal/**', 'wire/*', 'trial-*@*', 'src/main.js']) {
    assert.equal(judgeDeclaration([file(bad)]).structure, 'UNSOUND', `a destination "${bad}" is accepted`);
  }
  for (const bad of ['Promotion Source', 'Engineering / verify Stages (Promoting)']) {
    assert.equal(judgeDeclaration([file('next-line', bad)]).structure, 'UNSOUND', `a gate "${bad}" is accepted`);
  }
}
