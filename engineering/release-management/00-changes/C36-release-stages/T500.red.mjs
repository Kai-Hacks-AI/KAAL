// Case release/T500 tests: F54
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T500';
export const tests = ['release/F54'];
export const title = 'the stage judge accepts a well-formed Stage set and rejects incomplete, duplicate and unconnected Stages, and never judges a binding';

const stage = (o = {}) => ({ name: 'S', text: `---\ntype: Release/Stage\norder: ${o.order ?? 1}\nname: ${o.name ?? 'Build'}\nsubject: ${o.subject ?? 'candidate'}\ngates: ${o.gates ?? '[Check]'}\nauthority: ${o.authority ?? 'owner-approval'}\ntransition: ${o.transition ?? 'merge'}\ntarget: ${o.target ?? 'next'}\n${o.routes ? `routes: ${o.routes}\n` : ''}---\nbody\n` });

export async function run() {
  const src = join(repo, 'engineering/release-management/05-src/stages/stage-judge.mjs');
  assert.ok(existsSync(src), 'the stage judge is absent from the Engineering sources');
  const { judgeStages } = await import(pathToFileURL(src).href);
  const ok = judgeStages([stage({ order: 1, name: 'Build' }), stage({ order: 2, name: 'Ship', routes: '[Build]' })]);
  assert.equal(ok.valid, true, ok.findings.join('; '));
  assert.deepEqual(ok.stages, ['Build', 'Ship']);
  assert.equal(ok.bindingCoverage, 'UNKNOWN', 'a binding is judged');
  const bad = (files, what) => assert.equal(judgeStages(files).valid, false, what);
  bad([stage({ order: 1, name: 'A' }), stage({ order: 1, name: 'B' })], 'a duplicate order is accepted');
  bad([stage({ order: 1, name: 'A' }), stage({ order: 2, name: 'A' })], 'a duplicate name is accepted');
  bad([stage({ authority: 'anyone' })], 'an unknown authority is accepted');
  bad([stage({ transition: 'teleport' })], 'an unknown transition is accepted');
  bad([stage({ gates: '[]' })], 'a Stage without a gate is accepted');
  bad([stage({ routes: '[Nowhere]' })], 'a route naming an unknown Stage is accepted');
  bad([{ name: 'S', text: '---\ntype: Release/Stage\norder: 1\nname: A\n---\n' }], 'a missing key is accepted');
}
