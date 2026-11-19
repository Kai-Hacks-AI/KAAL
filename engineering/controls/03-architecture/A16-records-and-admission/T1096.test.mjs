// Case controls/T1096 tests: controls/A16
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const RECORDS = join(repo, 'engineering/controls/06-records');
const files = () => { const out = []; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name === '.git') continue; const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(md|mjs)$/.test(e.name)) out.push({ path: p, text: readFileSync(p, 'utf8') }); } }; walk(join(repo, 'engineering')); return out; };
const controls = async () => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls(files()).controls.filter((c) => c.valid); };

export const id = 'controls/T1096';
export const tests = ['controls/A16'];
export const title = 'the records of control runs have a place, are read by the controls package and a tested claim is admitted only when shown by them';
export async function run() {
  assert.ok(existsSync(RECORDS), 'engineering/controls/06-records does not exist');
  const { judgeEvidence, readRecords } = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  const records = readRecords(RECORDS);
  assert.ok(Array.isArray(records), 'the records were not read');
  const cs = await controls();
  for (const c of cs) {
    const v = judgeEvidence(c, records);
    assert.ok(['PASS', 'UNKNOWN'].includes(v.verdict), `${c.id} has no verdict`);
    if (c.status === 'tested') assert.equal(v.verdict, 'PASS', `${c.id} claims tested and its records do not show it`);
  }
}
