// Case controls/T479 tests: controls/A8
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FINDER = join(dir, 'skills/kaal-controls/scripts/find-controls.mjs');
async function finder() { assert.ok(existsSync(FINDER), 'the finder is absent'); const m = await import(pathToFileURL(FINDER).href); assert.equal(typeof m.findControls, 'function', 'the finder exports no findControls'); return m.findControls; }
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T479';
export const tests = ['controls/A8'];
export const title = 'the finder sits in the Skill, inside the files the package ships, and its pure function imports nothing';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const pkg = JSON.parse((await import('node:fs')).readFileSync(join(dir, 'package.json'), 'utf8'));
  assert.ok(pkg.files.includes('skills'), 'the package does not ship the Skill folder');
  const text = (await import('node:fs')).readFileSync(FINDER, 'utf8');
  const head = text.split('\n').filter((l) => /^\s*import\s/.test(l));
  assert.deepEqual(head.filter((l) => !/from 'node:(fs|path|url)'/.test(l)), [], 'the finder imports more than the command line entry needs');
}
