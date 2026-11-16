// Case release/T501 tests: F54
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T501';
export const tests = ['release/F54'];
export const title = 'a Stage declaration names no platform, tool or registry: the binding is separate';

const file = (extra) => ({ name: 'S', text: `---\ntype: Release/Stage\norder: 1\nname: Build\nsubject: candidate\ngates: [Check]\nauthority: owner-approval\ntransition: merge\ntarget: ${extra}\n---\nbody\n` });

export async function run() {
  const src = join(repo, 'engineering/release-management/05-src/stages/stage-judge.mjs');
  assert.ok(existsSync(src), 'the stage judge is absent from the Engineering sources');
  const { judgeStages } = await import(pathToFileURL(src).href);
  assert.equal(judgeStages([file('next')]).valid, true);
  for (const word of ['GitHub ruleset', 'githooks', 'npm registry', 'branch main', 'workflow']) {
    assert.equal(judgeStages([file(word)]).valid, false, `a Stage naming "${word}" is accepted`);
  }
}
