// Case release/T500 tests: F54
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T500';
export const tests = ['release/F54'];
export const title = 'the declaration judge finds a well-formed Stage set sound and an incomplete, duplicate or unconnected one unsound, and a sound set is never an authorization, readiness or a binding verdict';

const stage = (o = {}) => ({ name: 'S', text: `---\ntype: Release/Stage\norder: ${o.order ?? 1}\nname: ${o.name ?? 'Build'}\nsubject: ${o.subject ?? 'candidate'}\ngates: ${o.gates ?? '[checked]'}\nauthority: ${o.authority ?? 'owner-approval'}\ntransition: ${o.transition ?? 'integrate'}\ndestination: ${o.destination ?? 'next-line'}\n${o.parts ? `parts: ${o.parts}\n` : ''}---\nbody\n` });

export async function run() {
  const src = join(repo, 'engineering/release-management/05-src/stage-declaration/declaration-judge.mjs');
  assert.ok(existsSync(src), 'the declaration judge is absent from the Engineering sources');
  const { judgeDeclaration } = await import(pathToFileURL(src).href);
  const ok = judgeDeclaration([stage({ order: 1, name: 'Build', parts: '[Local, Remote]' }), stage({ order: 2, name: 'Ship' })]);
  assert.equal(ok.structure, 'SOUND', ok.findings.join('; '));
  assert.deepEqual(ok.stages, ['Build', 'Ship']);
  for (const k of ['authorization', 'readiness', 'bindingCoverage']) assert.equal(ok[k], 'UNKNOWN', `${k} is judged for a sound structure`);
  assert.ok(!('valid' in ok) && !('ready' in ok) && !('allowed' in ok), 'a boolean that reads as ready or allowed is given');
  const bad = (files, what) => assert.equal(judgeDeclaration(files).structure, 'UNSOUND', what);
  bad([stage({ order: 1, name: 'A' }), stage({ order: 1, name: 'B' })], 'a duplicate order is accepted');
  bad([stage({ order: 1, name: 'A' }), stage({ order: 2, name: 'A' })], 'a duplicate name is accepted');
  bad([stage({ authority: 'anyone' })], 'an unknown authority is accepted');
  bad([stage({ transition: 'teleport' })], 'an unknown transition is accepted');
  bad([stage({ gates: '[]' })], 'a Stage without a gate is accepted');
  bad([stage({ parts: '[P, P]' })], 'a part repeated in a Stage is accepted');
  bad([stage({ order: 1, name: 'A', parts: '[P]' }), stage({ order: 2, name: 'B', parts: '[P]' })], 'a part repeated across Stages is accepted');
  bad([stage({ order: 1, name: 'A', parts: '[B]' }), stage({ order: 2, name: 'B' })], 'a part named like a Stage is accepted');
  bad([{ name: 'S', text: '---\ntype: Release/Stage\norder: 1\nname: A\n---\n' }], 'a missing key is accepted');
}
