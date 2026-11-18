// Case controls/T536 tests: controls/I5
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FINDER = join(dir, 'skills/kaal-controls/scripts/find-controls.mjs');
const TYPES = ['directive', 'preventive', 'detective', 'corrective'];
async function finder() { assert.ok(existsSync(FINDER), 'the finder is absent'); const m = await import(pathToFileURL(FINDER).href); assert.equal(typeof m.findControls, 'function', 'the finder exports no findControls'); return m.findControls; }
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T536';
export const tests = ['controls/I5'];
export const title = 'the command prints the type of every control it finds';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const tmp = mkdtempSync(join(tmpdir(), 'ctl-type-'));
  mkdirSync(join(tmp, 'CTL1-a'));
  writeFileSync(join(tmp, 'CTL1-a/CTL1.md'), item({ type: 'preventive' }));
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, tmp], { encoding: 'utf8' }));
  assert.equal(out.refused.length, 0, 'a typed control was refused');
  assert.equal(out.controls[0]?.type, 'preventive', 'the printed control has no type');
}
